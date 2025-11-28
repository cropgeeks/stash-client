import { apiAxios, type ErrorHandler, type ResponseHandler } from '@/plugins/api/base'
import type { Attributes } from '../types/stash'

function apiGetAttributes (onSuccess?: ResponseHandler<Attributes[]>, onError?: ErrorHandler) {
  return apiAxios({ url: 'attribute', success: onSuccess, method: 'GET', data: undefined, error: onError })
}

export {
  apiGetAttributes,
}
