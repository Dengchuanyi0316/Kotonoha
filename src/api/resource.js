import request from '@/utils/request';

// 查询所有资源
export function getAllResources() {
  return request.get('/resources')
}

// 上传资源文件
export function uploadResourceFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/resources/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传缩略图
export function uploadThumbnail(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/resources/upload/thumbnail', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 新增资源
export function addResource(data) {
  return request.post('/resources', data);
}

// 获取动画资源
export function getAnimationResources() {
  return request.get('/resources/animation')
}

// 获取游戏资源
export function getGameResources() {
  return request.get('/resources/game')
}

// 获取工具资源
export function getToolResources() {
  return request.get('/resources/tool')
}
