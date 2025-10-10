import request from '@/utils/request'

// 查询微信机器人配置列表
export function listRobotconfig(query) {
  return request({
    url: '/robotconfig/robotconfig/list',
    method: 'get',
    params: query
  })
}

// 查询微信机器人配置详细
export function getRobotconfig(id) {
  return request({
    url: '/robotconfig/robotconfig/' + id,
    method: 'get'
  })
}

// 新增微信机器人配置
export function addRobotconfig(data) {
  return request({
    url: '/robotconfig/robotconfig',
    method: 'post',
    data: data
  })
}

// 修改微信机器人配置
export function updateRobotconfig(data) {
  return request({
    url: '/robotconfig/robotconfig',
    method: 'put',
    data: data
  })
}

// 删除微信机器人配置
export function delRobotconfig(id) {
  return request({
    url: '/robotconfig/robotconfig/' + id,
    method: 'delete'
  })
}

//机器人二维码
export function wxBotQrCode(appId) {
  return request({
    url: '/robot/common/getQr',
    method: 'post',
    params: { appId: appId }
  })
}


export function confirmWxLogin(key) {
  // 确保key不为空
  if (!key) {
    console.error('confirmWxLogin: key参数为空');
    return Promise.reject(new Error('key参数为空'));
  }
  return request({
    url: '/robot/common/checkQr/' + key,  // 按照后端控制器要求直接拼接URL，注意路径变量定义格式
    method: 'get'
  });
}





