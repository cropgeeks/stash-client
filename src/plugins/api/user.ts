import { apiAxios, apiForm, type ErrorHandler, type ResponseHandler } from '@/plugins/api/base'
import type { BasicUser, PaginatedRequest, PaginatedResult, UserPasswordUpdate, ViewTableUsers } from '../types/stash'

function apiPostUserTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<ViewTableUsers[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'user/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPatchUser (user: BasicUser, onSuccess?: ResponseHandler<ViewTableUsers>, onError?: ErrorHandler) {
  return apiAxios({ url: `user/${user.id}`, method: 'PATCH', data: user, success: onSuccess, error: onError })
}

function apiPatchUserPassword (userId: number, userPasswords: UserPasswordUpdate, onSuccess?: ResponseHandler<void>, onError?: ErrorHandler) {
  return apiAxios({ url: `user/${userId}/password`, method: 'PATCH', data: userPasswords, success: onSuccess, error: onError })
}

function apiPatchUserPasswordForced (userId: number, userPasswords: UserPasswordUpdate, onSuccess?: ResponseHandler<void>, onError?: ErrorHandler) {
  return apiAxios({ url: `user/${userId}/password-forced`, method: 'PATCH', data: userPasswords, success: onSuccess, error: onError })
}

function apiPostUser (user: BasicUser, onSuccess?: ResponseHandler<boolean>, onError?: ErrorHandler) {
  return apiAxios({ url: 'user', method: 'POST', data: user, success: onSuccess, error: onError })
}

function apiPostUserImage (userId: number, formData: FormData, onSuccess?: ResponseHandler<boolean>, onError?: ErrorHandler) {
  return apiForm({ url: `user/${userId}/img`, formData, success: onSuccess, error: onError })
}

function apiDeleteUser (userId: number, onSuccess?: ResponseHandler<void>, onError?: ErrorHandler) {
  return apiAxios({ url: `user/${userId}`, method: 'DELETE', data: undefined, success: onSuccess, error: onError })
}

export {
  apiPostUserTable,
  apiPatchUser,
  apiPostUser,
  apiPostUserImage,
  apiPatchUserPassword,
  apiPatchUserPasswordForced,
  apiDeleteUser,
}
