import request from '@/utils/request'

// 查询账单列表
export function listBill(query) {
  return request({
    url: '/logistics/bill/list',
    method: 'get',
    params: query
  })
}

// 查询账单详细
export function getBill(id) {
  return request({
    url: '/logistics/bill/' + id,
    method: 'get'
  })
}

// 新增账单
export function addBill(data) {
  return request({
    url: '/logistics/bill',
    method: 'post',
    data: data
  })
}

// 修改账单
export function updateBill(data) {
  return request({
    url: '/logistics/bill',
    method: 'put',
    data: data
  })
}

// 删除账单
export function delBill(id) {
  return request({
    url: '/logistics/bill/' + id,
    method: 'delete'
  })
}

// 导出账单
export function exportBill(query) {
  return request({
    url: '/logistics/bill/export',
    method: 'get',
    params: query
  })
}

// 更新账单状态
export function updateBillStatus(data) {
  return request({
    url: '/logistics/bill/status',
    method: 'put',
    data: data
  })
}

// 获取账单统计数据
export function getBillStatistics() {
  return request({
    url: '/logistics/bill/statistics',
    method: 'get'
  })
}

// 获取汇率信息
export function getExchangeRate() {
  return request({
    url: '/logistics/bill/exchange-rate',
    method: 'get'
  })
}

// 更新汇率信息
export function updateExchangeRate(data) {
  return request({
    url: '/logistics/bill/exchange-rate',
    method: 'put',
    data: data
  })
} 