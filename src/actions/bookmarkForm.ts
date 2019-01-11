import { createAction } from 'typesafe-actions'
import { Dispatch, Action } from 'redux'
import HatenaLogin from '../utils/login'
import { ILoginState, } from '../reducers/login'
const hatenaLogin = new HatenaLogin()

export const ADD_BOOKMARK = 'ADD_BOOKMARK'
export const CLOSE_BOOKMARK = 'CLOSE_BOOKMARK'
export const SHOW_BOOKMARK_DATA = 'SHOW_BOOKMARK_DATA'

export interface IBookmarkData {
  comment: string
  isBookmark: boolean
  tags: string[]
  user?: string
}

export interface IShowBookmarkData extends Action<string> {
  payload: IBookmarkData
}

export const addBookmark = createAction(
  ADD_BOOKMARK, 
)

export const closeBookmark = createAction(
  CLOSE_BOOKMARK, 
)

const showBookmarkData = createAction(
  SHOW_BOOKMARK_DATA, 
  resolve => (obj: IBookmarkData) => {
    return resolve({
      comment: obj.comment,
      isBookmark: obj.isBookmark,
      tags: obj.tags
    })
  },
)

export const actions = { addBookmark, closeBookmark, showBookmarkData, }

export const saveBookmark = (loginData: ILoginState, url: string, comment = ''): (dispatch: Dispatch) => void => (
  dispatch => {
    if (!loginData.userData) return

    hatenaLogin.sendRequest(
      'POST',
      'http://api.b.hatena.ne.jp/1/my/bookmark',
      loginData.userData.token,
      loginData.userData.secret,
      {
        url: url,
        comment: comment
      }
    )

    dispatch(closeBookmark())
  }
)

export const deleteBookmark = (loginData: ILoginState, url: string): (dispatch: Dispatch) => void => (
  dispatch => {
    if (!loginData.userData) return

    hatenaLogin.sendRequest(
      'DELETE',
      'http://api.b.hatena.ne.jp/1/my/bookmark',
      loginData.userData.token,
      loginData.userData.secret,
      {
        url: url
      }
    )

    dispatch(closeBookmark())
  }
)

export const fetchBookmarkData = (loginData: ILoginState, url: string): (dispatch: Dispatch) => void => (
  dispatch => {
    if (!loginData.userData) return

    hatenaLogin.sendRequest(
      'GET',
      `http://b.hatena.ne.jp/entry/jsonlite/?url=${url}&date=${Date.now()}broccoli`,
      loginData.userData.token,
      loginData.userData.secret,
    ).then(data => {
      let obj: IBookmarkData = {
        comment: '',
        isBookmark: false,
        tags: [],
      }

      data.bookmarks.map((val: IBookmarkData) => {
        if (loginData.userData && val.user === loginData.userData.urlName) {
          obj.comment = val.comment
          obj.isBookmark = true
          obj.tags = val.tags
        }
      })
      dispatch(showBookmarkData(obj))
    })
  }
)
