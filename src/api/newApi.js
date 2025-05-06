import request from '@/utils/request'

/**
 * 新接口请求示例
 * @returns {Promise}
 */
export function wbOrder() {
  return request({
    url: '/wps/wb/order',
    method: 'post'
  })
}