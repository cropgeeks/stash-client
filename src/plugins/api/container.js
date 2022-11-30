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

const apiPostContainerTransferEventTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'transfer/event/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostContainerTypeTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'containertype/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostContainerType = (data, onSuccess, onError) => apiAxios({ url: 'containertype', method: 'POST', data: data, success: onSuccess, error: onError })

const apiPostContainerImport = (data, onSuccess, onError) => apiAxios({ url: 'import', method: 'POST', data: data, success: onSuccess, error: onError })

export {
  apiPostContainerTable,
  apiPostContainerTransfer,
  apiPostContainerTransferTable,
  apiPostContainerTransferEventTable,
  apiPostContainerType,
  apiPostContainerTypeTable,
  apiPostContainerImport
}
