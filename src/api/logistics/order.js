import request from '@/utils/request'
import { useUserStore } from '@/store/modules/user'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/logistics/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(orderId) {
  return request({
    url: '/logistics/order/' + orderId,
    method: 'get'
  })
}

// 新增订单
export function addOrder(data) {
  return request({
    url: '/logistics/order',
    method: 'post',
    data: data
  })
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: '/logistics/order',
    method: 'put',
    data: data
  })
}

// 删除订单
export function delOrder(orderId) {
  return request({
    url: '/logistics/order/' + orderId,
    method: 'delete'
  })
}

// 导出订单
export function exportOrder(query) {
  return request({
    url: '/logistics/order/export',
    method: 'get',
    params: query
  })
}

// 获取物流轨迹
export function getTracking(orderId) {
  return request({
    url: '/logistics/order/tracking/' + orderId,
    method: 'get'
  })
}

// 上传文件
export function uploadFile(data) {
  return request({
    url: '/logistics/order/upload',
    method: 'post',
    data: data
  })
}

// 删除文件
export function deleteFile(fileId) {
  return request({
    url: '/logistics/order/file/' + fileId,
    method: 'delete'
  })
}

// 审批订单
export function approveOrder(data) {
  return request({
    url: '/logistics/order/approve',
    method: 'post',
    data: data
  })
}

// 更新物流轨迹
export function updateTracking(data) {
  return request({
    url: '/logistics/order/tracking',
    method: 'put',
    data: data
  })
}

// 批量导入订单
export function importOrder(data) {
  return request({
    url: '/logistics/order/import',
    method: 'post',
    data: data
  })
}

// 获取订单统计数据
export function getOrderStatistics() {
  return request({
    url: '/logistics/order/statistics',
    method: 'get'
  })
} 