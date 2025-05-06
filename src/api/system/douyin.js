import request from '@/utils/request'

// 解析视频分享链接
export function parseVideo(shareUrl) {
  return request({
    url: '/system/douyin/parse',
    method: 'post',
    params: { shareUrl }
  })
}

// 获取视频评论
export function getVideoComments(videoId) {
  return request({
    url: '/system/douyin/comments/' + videoId,
    method: 'get'
  })
}

// 获取作者信息
export function getAuthorInfo(authorId) {
  return request({
    url: '/system/douyin/author/' + authorId,
    method: 'get'
  })
}

// 获取作者所有视频
export function getAuthorVideos(authorId) {
  return request({
    url: '/system/douyin/author/' + authorId + '/videos',
    method: 'get'
  })
} 