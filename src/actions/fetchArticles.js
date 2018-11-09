import { parseString } from 'react-native-xml2js'
export const FETCH_ARTICLES = 'FETCH_ARTICLES'
export const FETCH_FAV_ARTICLES = 'FETCH_FAV_ARTICLES'
export const FETCH_BOOKMARK_ARTICLES = 'FETCH_BOOKMARK_ARTICLES'
export const CLEAR_ARTICLES = 'CLEAR_ARTICLES'
export const FETCH_FAILED = 'FETCH_FAILED'

export const fetchArticles = (item, index) => (
  {
    type: FETCH_ARTICLES,
    payload: {
      item: item,
      index: index
    }
  }
)

export const clearArticles = index => (
  {
    type: CLEAR_ARTICLES,
    payload: {
      index: index
    }
  }
)

export const fetchFavArticles = (item, index, offset) => (
  {
    type: FETCH_FAV_ARTICLES,
    payload: {
      item: item,
      index: index,
      offset: offset
    }
  }
)

export const fetchBookmarkArticles = (item, index, offset) => (
  {
    type: FETCH_BOOKMARK_ARTICLES,
    payload: {
      item: item,
      index: index,
      offset: offset
    }
  }
)

export const fetchFailed = index => (
  {
    type: FETCH_FAILED,
    payload: {
      index: index
    }
  }
)

export const getArticlesFromApi = (url, index) => (
  dispatch => (
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('timeout'))
      }, 10000)
      fetch(url)
        .then(res => res)
        .then(res => {
          parseString(res._bodyInit, (err, result) => {
            let items = result['rdf:RDF'].item

            items.map((data, index) => {
              items[index].link = data.link[0]
              items[index].title = data.title[0]
              items[index].bookmarkcount = data['hatena:bookmarkcount'][0]
            })
            dispatch(fetchArticles(items, index))
            resolve('success')
          })
        })
        .catch(error => {
          dispatch(fetchFailed(index))
          reject()
        })
      })
  )
)

export const getFavArticlesFromApi = (index, userName, offset) => (
  dispatch => {
    const apiUrl = 'http://b.hatena.ne.jp/' + userName + '/favorite.rss?of=' + offset

    fetch(apiUrl)
      .then(res => {
        if (res.status === 200) {
          parseString(res._bodyInit, (err, result) => {
            if (err) {
              console.log(err)
            }

            let items = result['rdf:RDF'].item

            items.map((data, index) => {
              items[index].link = data.link[0]
              items[index].title = data.title[0]
              items[index].bookmarkcount = data['hatena:bookmarkcount'][0]
              items[index].creator = data['dc:creator'][0]
            })
            dispatch(fetchFavArticles(items, index, offset + 25))
          })
        } else {
          dispatch(fetchFailed())
        }
      })
  }
)

export const getBookmarkArticlesFromApi = (index, userName, offset) => (
  dispatch => {
    const apiUrl = 'http://b.hatena.ne.jp/' + userName + '/rss?of=' + offset + '&d=' + Date.now()

    fetch(apiUrl)
      .then(res => {
        parseString(res._bodyInit, (err, result) => {
          if (err) {
            console.log(err)
          }

          let items = result['rdf:RDF'].item

          items.map((data, index) => {
            items[index].link = data.link[0]
            items[index].title = data.title[0]
            items[index].bookmarkcount = data['hatena:bookmarkcount'][0]
          })
          dispatch(fetchBookmarkArticles(result['rdf:RDF'].item, index, offset + 20))
        })
      })
  }
)
