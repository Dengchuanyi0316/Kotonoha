import request from '@/utils/request';

// 查询所有资源
export function getAllResources() {
  return request.get('/resources');
}

// 根据ID查询单个资源
export function getResource(id) {
  return request.get(`/resources/${id}`);
}

// 资源文件上传接口
export function uploadResourceFile(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  return request.post('/resources/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 缩略图上传接口
export function uploadThumbnail(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  return request.post('/resources/upload/thumbnail', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 新增资源，同时关联标签
export function addResource(resource) {
  return request.post('/resources', resource);
}

// 更新资源信息，同时更新标签
export function updateResource(id, resourceDTO) {
  return request.put(`/resources/${id}`, resourceDTO);
}

// 删除资源
export function deleteResource(id) {
  return request.delete(`/resources/${id}`);
}

// 获取动画资源
export function getAnimationResources() {
  return request.get('/resources/animation');
}

// 获取游戏资源
export function getGameResources() {
  return request.get('/resources/game');
}

// 获取工具资源
export function getToolResources() {
  return request.get('/resources/tool');
}
