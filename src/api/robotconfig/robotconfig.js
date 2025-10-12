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

// 启动指定的微信机器人
export function startRobot(appId) {
  // 确保appId不为空
  if (!appId) {
    console.error('startRobot: appId参数为空');
    return Promise.reject(new Error('appId参数为空'));
  }
  return request({
    url: '/robot/manager/start/' + appId,
    method: 'post'
  });
}

// 停止指定的微信机器人
export function stopRobot(appId) {
  // 确保appId不为空
  if (!appId) {
    console.error('stopRobot: appId参数为空');
    return Promise.reject(new Error('appId参数为空'));
  }
  return request({
    url: '/robot/manager/stop/' + appId,
    method: 'post'
  });
}

// 获取所有机器人的状态
export function getAllRobotStatus() {
  return request({
    url: '/robot/manager/status/all',
    method: 'get'
  });
}

// 获取指定机器人的状态
export function getRobotStatus(appId) {
  // 确保appId不为空
  if (!appId) {
    console.error('getRobotStatus: appId参数为空');
    return Promise.reject(new Error('appId参数为空'));
  }
  return request({
    url: '/robot/manager/status/' + appId,
    method: 'get'
  });
}





