import { apiAxios } from '@/plugins/api/base'

const apiGetAttributes = (onSuccess, onError) => apiAxios({ url: 'attribute', success: onSuccess, error: onError })

export {
  apiGetAttributes
}
