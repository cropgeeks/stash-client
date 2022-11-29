import { apiAxios } from '@/plugins/api/base'

const apiGetProjectById = (projectId, onSuccess, onError) => apiAxios({ url: `project/${projectId}`, success: onSuccess, error: onError })

const apiPostProjectTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return apiAxios({ url: 'project/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostProject = (data, onSuccess, onError) => apiAxios({ url: 'project', method: 'POST', data: data, success: onSuccess, error: onError })

export {
  apiGetProjectById,
  apiPostProject,
  apiPostProjectTable
}
