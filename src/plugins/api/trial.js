import { apiAxios } from '@/plugins/api/base'

const apiGetTrialById = (trialId, onSuccess, onError) => apiAxios({ url: `trial/${trialId}`, success: onSuccess, error: onError })

const apiPostTrialTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'trial/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiGetTrialById,
  apiPostTrialTable
}
