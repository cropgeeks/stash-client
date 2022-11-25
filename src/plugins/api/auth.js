import { apiAxios } from '@/plugins/api/base'

const apiPostToken = (queryData, onSuccess, onError) => apiAxios({ url: 'token', method: 'POST', data: queryData, success: onSuccess, error: onError })

export {
  apiPostToken
}
