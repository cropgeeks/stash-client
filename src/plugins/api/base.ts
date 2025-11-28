import { coreStore } from '@/stores/app'
import router from '@/router'
import { i18n } from '@/plugins/vuetify.ts'
import axios, { type AxiosResponse } from 'axios'

import emitter from 'tiny-emitter/instance'
import type { Token } from '@/plugins/types/stash'

const MAX_JAVA_INTEGER = 2_147_483_647

/**
 * Returns the current authentication token
 */
function getToken (): Token | undefined {
  const store = coreStore()
  let t = store.storeToken

  // Check if the token is still valid
  if (t && ((Date.now() - new Date(t.createdOn).getTime()) > t.lifetime)) {
    t = undefined
    store.setToken(t)
  }

  return t
}

function handleError (error: AxiosResponse) {
  const store = coreStore()
  emitter.emit('show-loading', false)
  let message = error.statusText

  switch (error.status) {
    case 400:
      message = i18n.global.t('httpErrorFourOO')
      break
    case 401:
      message = i18n.global.t('httpErrorFourOOne')
      store.setToken(undefined)
      router.push('/login')
      return
    case 403: {
      message = i18n.global.t('httpErrorFourOThree')
      store.setToken(undefined)
      router.push('/login')
      return
    }
    case 404:
      message = i18n.global.t('httpErrorFourOFour')
      break
    case 405:
      message = i18n.global.t('httpErrorFourOFour')
      break
    case 408:
      message = i18n.global.t('httpErrorFourOEight')
      break
    case 409:
      message = i18n.global.t('httpErrorFourONine')
      break
    case 410:
      message = i18n.global.t('httpErrorFourTen')
      break
    case 500:
      message = i18n.global.t('httpErrorFiveOO')
      break
    case 501:
      message = i18n.global.t('httpErrorFiveOOne')
      break
    case 503:
      message = i18n.global.t('httpErrorFiveOThree')
      break
  }

  emitter.emit('show-snackbar', {
    text: message,
    color: 'error',
  })
}

export interface ErrorHandler {
  codes: number[]
  callback: Function
}

export type ResponseHandler<T> = (args: T) => void

/**
 * Sends a FORM to the given URL using authentication
 * @param {Object} param0 `{ url: String, formData: Object, success: Callback, error: { codes: [], callback: Callback } }`
 */
function apiForm<T> ({ url, formData, success, error = { codes: [], callback: handleError } }: { url?: string, formData?: any | undefined, success?: ResponseHandler<T>, error?: ErrorHandler }) {
  const store = coreStore()
  const promise = axios.post(url || '', formData, {
    baseURL: store.storeServerUrl || '',
    // @ts-ignore
    crossDomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()?.token}`,
    },
  })

  promise.then(result => {
    const t = getToken()

    // Check if the token is still valid. Renew it if so.
    if (t && ((Date.now() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = Date.now()
      store.setToken(t)
    }

    if (success) {
      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 401) {
          store.setToken(undefined)
          // We're using the emitter here rather than directly accessing the router to prevent a circular dependency
          emitter.emit('route', { name: 'login' })
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          return error.callback(err.response)
        } else {
          return handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true,
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }

    throw err
  })

  return promise
}

/**
 * Sends an Axios request to the server using authentication
 * @param {Object} param0 `{ url: String, method: String, data: Object, dataType: String, contentType: String, success: Callback, error: { codes: [], callback: Callback } }`
 */
function apiAxios<T> ({ url, method = 'GET', data, dataType = 'json', contentType = 'application/json; charset=utf-8', success, error = { codes: [], callback: handleError } }: { url?: string, method: string, data: any, dataType?: string, contentType?: string, success?: ResponseHandler<T>, error?: ErrorHandler }) {
  let requestData = null
  let requestParams = null
  const store = coreStore()

  // Stringify the data object for non-GET requests
  if (data !== null || data !== undefined) {
    if (method === 'GET') {
      requestParams = data
    } else {
      requestData = data
    }
  }

  const token = getToken()?.token

  const params = {
    baseURL: store.storeServerUrl || '',
    url,
    method,
    data: requestData,
    params: requestParams,
    crossDomain: true,
    responseType: dataType,
    withCredentials: true,
    headers: {
      'Content-Type': contentType,
    },
  }

  if (token) {
    // @ts-ignore
    params.headers.Authorization = `Bearer ${getToken()?.token}`
  }

  // @ts-ignore
  const promise = axios(params)

  promise.then(result => {
    const t = getToken()

    // Check if the token is still valid. Renew it if so.
    if (t && ((Date.now() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = Date.now()
      store.setToken(t)
    }

    if (success) {
      if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
        const filename = result.headers['content-disposition']
          .split(';')
          .map((p: string) => p.trim())
          .filter((p: string) => p.indexOf('filename') === 0)
          .map((p: string) => p.replace('filename=', ''))

        if (filename && filename.length > 0) {
          result.data.filename = filename[0]
        }
      }

      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 401) {
          store.setToken(undefined)
          // We're using the emitter here rather than directly accessing the router to prevent a circular dependency
          emitter.emit('route', { name: 'login' })
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          return error.callback(err.response)
        } else {
          return handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true,
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }

    throw err
  })

  return promise
}

export {
  MAX_JAVA_INTEGER,
  getToken,
  handleError,
  apiAxios,
  apiForm,
}
