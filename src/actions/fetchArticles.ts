import axios from 'axios'
import { createAction, createAsyncAction, } from 'typesafe-actions'
import { parseString } from 'react-native-xml2js'
import { Action, Dispatch } from 'redux'
import { ThunkDispatch, } from 'redux-thunk'
import { IAppState, } from '../reducers/app'
export const FETCH_ARTICLES = 'FETCH_ARTICLES'
export const FETCH_BOOKMARK_ARTICLES = 'FETCH_BOOKMARK_ARTICLES'
export const FETCH_BOOKMARK_CACHE = 'FETCH_BOOKMARK_CACHE'
export const FETCH_FAILED = 'FETCH_FAILED'
export const FETCH_BOOKMARK_FAILED = 'FETCH_BOOKMARK_FAILED'
export const FETCH_SEARCH_RESULT = 'FETCH_SEARCH_RESULT'

interface IArticle {
  link: string
  title: string
  bookmarkcount: number
  domain: string
  favicon: string
}

export interface IFetchArticles extends Action {
  payload: {
    items: IArticle[]
    index: string
  }
}

interface IFetchBookmarkArticles extends Action {
  payload: {
    items: IArticle[]
  }
}

interface ISearchResponse {
  items: any[]
  keyword: string
  offset: number
  total: number
}

interface IFetchSearchResult extends Action {
  payload: ISearchResponse
}

export interface IFetchFailed extends Action {
  payload: {
    index: string
  }
}

export interface IUserData {
  displayName: string
  secret: string
  token: string
}

export interface IHotentrySuccess {
  items: IArticle[]
  index: string
}

const fetchHotentry = createAsyncAction(
  'FETCH_HOTENTRY_REQUEST',
  'FETCH_HOTENTRY_SUCCESS',
  'FETCH_HOTENTRY_FAILURE',
)<{ index: string }, IHotentrySuccess, { index: string }>()

export const loadHotentry = (url: string, indexName: string): (dispatch: ThunkDispatch<IAppState, undefined, any>) => void => (
  dispatch => {
    dispatch(fetchHotentry.request({ index: indexName, }))
    return (
      axios.get(url, { timeout: 5000 })
        .then((res: any) => {
          console.log(res)
          parseString(res.data, (err: any, result: any) => {
            let items = result['rdf:RDF'].item
            items.map((data: any, index: number) => {
              items[index].link = data.link[0]
              items[index].title = data.title[0]
              items[index].bookmarkcount = parseInt(data['hatena:bookmarkcount'][0])
            })
            dispatch(fetchHotentry.success({ items: items, index: indexName, }))
          })
        })
        .catch(error => {
          dispatch(fetchHotentry.failure({ index: indexName }))
        })
    )
  }
)

export const fetchArticles = createAction(
  FETCH_ARTICLES,
  resolve => (items: IArticle[] , index: string) => resolve({ items, index }),
)

export const fetchBookmarkArticles = createAction(
  FETCH_BOOKMARK_ARTICLES,
  resolve => (items: IArticle[]) => resolve({ items }),
)

export const fetchBookmarkCache = createAction(
  FETCH_BOOKMARK_CACHE,
)

export const fetchSearchResult = createAction(
  FETCH_SEARCH_RESULT,
  resolve => (payload: ISearchResponse) => resolve({ ...payload }),
)

export const fetchFailed = createAction(
  FETCH_FAILED,
  resolve => (index: string) => resolve({ index, }),
)

export const fetchBookmarkFailed = createAction(
  FETCH_BOOKMARK_FAILED,
  resolve => (index: string) => resolve({ index, }),
)

const fetchMyBookamrk = createAsyncAction(
  'FETCH_MY_BOOKMARK_REQUEST',
  'FETCH_MY_BOOKMARK_SUCCESS',
  'FETCH_MY_BOOKMARK_FAILURE',
)<void, IArticle[], void>()

export const actions = {
  fetchArticles,
  fetchBookmarkArticles,
  fetchFailed,
  fetchBookmarkFailed,
  fetchHotentry,
}

export const loadMyBookmark = (userData: IUserData): (dispatch: ThunkDispatch<IAppState, undefined, any>) => void => (
  dispatch => {
    dispatch(fetchMyBookamrk.request())

    return (
      axios.get(`http://b.hatena.ne.jp/${userData.displayName}/rss?d=${Date.now()}`, { timeout: 5000 })
        .then((res: any) => {
          parseString(res.data, (err: any, result: any) => {
            let items = result['rdf:RDF'].item
            items.map((data: any, index: number) => {
              items[index].link = data.link[0]
              items[index].title = data.title[0]
              items[index].bookmarkcount = parseInt(data['hatena:bookmarkcount'][0])
            })
            dispatch(fetchMyBookamrk.success(items))
          })
        })
        .catch(error => {
          dispatch(fetchMyBookamrk.failure())
        })
    )
  }
)

const fetchSearch = createAsyncAction(
  'FETCH_SEARCH_RESULT_REQUEST',
  'FETCH_SEARCH_RESULT_SUCCESS',
  'FETCH_SEARCH_RESULT_FAILURE',
)<void, ISearchResponse, void>()

export const myBookmarkActions = {
  fetchMyBookamrk,
  fetchSearch,
  fetchBookmarkCache,
}

export const loadSearchResult = (keyword: string, userData: IUserData, offset: number): (dispatch: ThunkDispatch<IAppState, undefined, any>) => void => (
  dispatch => {
    dispatch(fetchSearch.request())

    return (
      axios.get(`https://b.hatena.ne.jp/${userData.displayName}/search/json?q=${keyword}&of=${offset}`)
        .then(res => {
          let items = res.data.bookmarks || []

          if (items.length > 0) {
            items.map((item: any, index: any) => {
              const domain = item.entry.url.split('/')[2]
              items[index].link = item.entry.url
              items[index].title = item.entry.title
              items[index].bookmarkcount = item.entry.count
              items[index].domain = domain
              items[index].favicon = `https://www.google.com/s2/favicons?domain=${domain}`
            })
          }

          const payload: ISearchResponse = {
            items,
            keyword,
            offset,
            total: res.data.meta.total
          }

          dispatch(fetchSearch.success(payload))
        })
        .catch(error => {
          dispatch(fetchSearch.failure())
        })
    )
  }
  //dispatch => (
  //  new Promise((resolve, reject) => {
  //    const emptyPayload = {
  //      items: [],
  //      keyword,
  //      offset,
  //      total: 0
  //    }
  //    dispatch(fetchSearchResult(emptyPayload))

  //    const timeout = setTimeout(() => {
  //      reject(new Error('timeout'))
  //    }, 10000)
  //    fetch(`https://b.hatena.ne.jp/${userData.displayName}/search/json?q=${keyword}&of=${offset}`)
  //      .then(res => res.json())
  //      .then(res => {
  //        let items = res.bookmarks || []

  //        if (items.length > 0) {
  //          items.map((item: any, index: any) => {
  //            const domain = item.entry.url.split('/')[2]
  //            items[index].link = item.entry.url
  //            items[index].title = item.entry.title
  //            items[index].bookmarkcount = item.entry.count
  //            items[index].domain = domain
  //            items[index].favicon = `https://www.google.com/s2/favicons?domain=${domain}`
  //          })
  //        }

  //        const payload: ISearchResponse = {
  //          items,
  //          keyword,
  //          offset,
  //          total: res.meta.total
  //        }

  //        dispatch(fetchSearchResult(payload))
  //        resolve('success')
  //      })
  //      .catch(error => {
  //        reject(new Error('error'))
  //      })
  //    })
  //)
)
