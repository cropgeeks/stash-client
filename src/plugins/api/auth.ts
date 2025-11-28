import { apiAxios, type ErrorHandler, type ResponseHandler } from '@/plugins/api/base'
import { UsersUserType, type LoginDetails, type Token } from '@/plugins/types/stash'

/**
 * Checks whether the given user type is at least the given minimum user type
 * @param {String} userType The user type to check
 * @param {String} atLeast The user type to check against
 */
function userIsAtLeast (userType: UsersUserType, atLeast?: UsersUserType) {
  switch (atLeast) {
    case UsersUserType.admin:
      return userType === UsersUserType.admin
    case UsersUserType.regular:
      return userType === UsersUserType.admin || userType === UsersUserType.regular
    case UsersUserType.reference:
      return userType === UsersUserType.admin || userType === UsersUserType.regular || userType === UsersUserType.reference
  }

  return false
}

function apiCheckToken (token: Token, onSuccess?: ResponseHandler<void>, onError?: ErrorHandler) {
  return apiAxios({ url: 'token/check', method: 'POST', data: token, success: onSuccess, error: onError })
}

function apiPostToken (queryData: LoginDetails, onSuccess?: ResponseHandler<Token>, onError?: ErrorHandler) {
  return apiAxios({ url: 'token', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiDeleteToken (queryData: LoginDetails, onSuccess?: ResponseHandler<boolean>, onError?: ErrorHandler) {
  return apiAxios({ url: 'token', method: 'DELETE', data: queryData, success: onSuccess, error: onError })
}

export {
  userIsAtLeast,
  apiPostToken,
  apiCheckToken,
  apiDeleteToken,
}
