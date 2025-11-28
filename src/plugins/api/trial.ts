import { apiAxios, type ErrorHandler, type ResponseHandler } from '@/plugins/api/base'
import type { PaginatedRequest, PaginatedResult, Trials } from '../types/stash'

function apiGetTrialById (trialId: number, onSuccess?: ResponseHandler<Trials>, onError?: ErrorHandler) {
  return apiAxios({ url: `trial/${trialId}`, method: 'GET', data: undefined, success: onSuccess, error: onError })
}

function apiPostTrialTable (queryData: PaginatedRequest, onSuccess?: ResponseHandler<PaginatedResult<Trials[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return apiAxios({ url: 'trial/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrial (data: Trials, onSuccess?: ResponseHandler<Trials>, onError?: ErrorHandler) {
  return apiAxios({ url: 'trial', method: 'POST', data, success: onSuccess, error: onError })
}

export {
  apiGetTrialById,
  apiPostTrial,
  apiPostTrialTable,
}
