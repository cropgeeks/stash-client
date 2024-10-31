import { apiAxios, apiForm } from '@/plugins/api/base'

const apiPostUserTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'user/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPatchUser = (user, onSuccess, onError) => apiAxios({ url: `user/${user.id}`, method: 'PATCH', data: user, success: onSuccess, error: onError })

const apiPatchUserPassword = (userPasswords, onSuccess, onError) => apiAxios({ url: 'user/password', method: 'PATCH', data: userPasswords, success: onSuccess, error: onError })

const apiPostUser = (user, onSuccess, onError) => apiAxios({ url: 'user', method: 'POST', data: user, success: onSuccess, error: onError })

const apiPostUserImage = (userId, formData, onSuccess, onError) => apiForm({ url: `user/${userId}/img`, formData: formData, success: onSuccess, error: onError })

const apiDeleteUser = (userId, onSuccess, onError) => apiAxios({ url: `user/${userId}`, method: 'DELETE', success: onSuccess, error: onError })

export {
  apiPostUserTable,
  apiPatchUser,
  apiPostUser,
  apiPostUserImage,
  apiPatchUserPassword,
  apiDeleteUser
}
