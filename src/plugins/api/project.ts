import { apiAxios, type ErrorHandler, type ResponseHandler } from '@/plugins/api/base'
import type { PaginatedRequest, PaginatedResult, Projects } from '@/plugins/types/stash'

function apiGetProjectById (projectId: number, onSuccess?: ResponseHandler<Projects>, onError?: ErrorHandler) {
  return apiAxios({ url: `project/${projectId}`, method: 'GET', data: undefined, success: onSuccess, error: onError })
}

function apiPostProjectTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<Projects[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'project/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostProject (data: Projects, onSuccess?: ResponseHandler<Projects>, onError?: ErrorHandler) {
  return apiAxios({ url: 'project', method: 'POST', data, success: onSuccess, error: onError })
}

export {
  apiGetProjectById,
  apiPostProject,
  apiPostProjectTable,
}
