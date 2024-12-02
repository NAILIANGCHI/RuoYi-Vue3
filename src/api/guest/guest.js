import request from '@/utils/request'

// 查询客户主表列表
export function listGuest(query) {
  return request({
    url: '/guest/list',
    method: 'get',
    params: query
  })
}
export function listDelGuest(query) {
  return request({
    url: '/guest/del/list',
    method: 'get',
    params: query
  })
}


// 查询客户主表详细
export function getGuest(id) {
  return request({
    url: '/guest/' + id,
    method: 'get'
  })
}

// 新增客户主表
export function addGuest(data) {
  return request({
    url: '/guest',
    method: 'post',
    data: data
  })
}

// 修改客户主表
export function updateGuest(data) {
  return request({
    url: '/guest',
    method: 'put',
    data: data
  })
}

// 删除客户主表
export function delGuest(id) {
  return request({
    url: '/guest/' + id,
    method: 'delete'
  })
}
