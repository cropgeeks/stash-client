import { apiAxios } from '@/plugins/api/base'

const apiPostUserTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'user/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostUserTable
}
