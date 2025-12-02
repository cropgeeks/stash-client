import { apiAxios, type ErrorHandler, type ResponseHandler } from '@/plugins/api/base'
import type { Attributes, ContainerAttributes, ContainerAttributeTimeline, ContainerImport, ContainerTransfer, ContainerTypes, PaginatedRequest, PaginatedResult, ViewTableContainers, ViewTableTransferEvents, ViewTableTransfers } from '@/plugins/types/stash'

function apiPostContainers (data: ViewTableContainers[], onSuccess?: ResponseHandler<number[]>, onError?: ErrorHandler) {
  return apiAxios({ url: 'container', method: 'POST', data, success: onSuccess, error: onError })
}

function apiPostContainersToParent (parentId: number, data: ViewTableContainers[], onSuccess?: ResponseHandler<number[]>, onError?: ErrorHandler) {
  return apiAxios({ url: `container/${parentId}`, method: 'POST', data, success: onSuccess, error: onError })
}

function apiPostContainerTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<ViewTableContainers[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'container/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostContainerTransfer (queryData: ContainerTransfer, onSuccess?: ResponseHandler<number>, onError?: ErrorHandler) {
  return apiAxios({ url: 'transfer', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostContainerTransferTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<ViewTableTransfers[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'transfer/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostContainerTransferEventTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<ViewTableTransferEvents[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'transfer/event/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostContainerTypeTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<ContainerTypes[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'containertype/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostContainerType (data: ContainerTypes, onSuccess?: ResponseHandler<ContainerTypes>, onError?: ErrorHandler) {
  return apiAxios({ url: 'containertype', method: 'POST', data, success: onSuccess, error: onError })
}

function apiPostContainerImport (data: ContainerImport, onSuccess?: ResponseHandler<void>, onError?: ErrorHandler) {
  return apiAxios({ url: 'import', method: 'POST', data, success: onSuccess, error: onError })
}

function apiGetContainerClear (containerId: number, onSuccess?: ResponseHandler<void>, onError?: ErrorHandler) {
  return apiAxios({ url: `container/${containerId}/clear`, method: 'GET', data: undefined, success: onSuccess, error: onError })
}

function apiGetContainerAttributes (containerId: number, onSuccess?: ResponseHandler<ContainerAttributes[]>, onError?: ErrorHandler) {
  return apiAxios({ url: `container/${containerId}/attribute`, method: 'GET', data: undefined, success: onSuccess, error: onError })
}

export {
  apiPostContainers,
  apiGetContainerAttributes,
  apiPostContainersToParent,
  apiPostContainerTable,
  apiPostContainerTransfer,
  apiPostContainerTransferTable,
  apiPostContainerTransferEventTable,
  apiPostContainerType,
  apiPostContainerTypeTable,
  apiPostContainerImport,
  apiGetContainerClear,
}
