import { apiAxios } from '@/plugins/api/base'

const apiPostContainerTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'container/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostContainerTransfer = (queryData, onSuccess, onError) => apiAxios({ url: 'transfer', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostContainerTransferTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'transfer/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostContainerTable,
  apiPostContainerTransfer,
  apiPostContainerTransferTable
}
