import { apiAxios } from '@/plugins/api/base'

/**
 * Checks whether the given user type is at least the given minimum user type
 * @param {String} userType The user type to check
 * @param {String} atLeast The user type to check against
 */
const userIsAtLeast = (userType, atLeast) => {
  switch (atLeast) {
    case 'admin':
      return userType === 'admin'
    case 'regular':
      return userType === 'admin' || userType === 'regular'
    case 'reference':
      return userType === 'admin' || userType === 'regular' || userType === 'reference'
  }

  return false
}

const apiCheckToken = (token, onSuccess, onError) => apiAxios({ url: 'token/check', method: 'POST', data: token, success: onSuccess, error: onError })

const apiPostToken = (queryData, onSuccess, onError) => apiAxios({ url: 'token', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiDeleteToken = (queryData, onSuccess, onError) => apiAxios({ url: 'token', method: 'DELETE', data: queryData, success: onSuccess, error: onError })

export {
  userIsAtLeast,
  apiPostToken,
  apiCheckToken,
  apiDeleteToken
}
