// src/api/fragment.js
import request from '@/utils/request'

// 获取所有片段（笔记）
export function fetchFragments() {
  return request.get('/fragments')
}

// 创建一个新片段
export function createFragment(data) {
  return request.post('/fragments', data)
}

// 更新一个片段
export function updateFragment(id, data) {
  return request.put(`/fragments`, data)
}

// 删除一个片段（如你需要）
export function deleteFragment(id) {
  return request.delete(`/fragments/${id}`)
}

// 获取单个片段（可选）
export function getFragment(id) {
  return request.get(`/fragments/${id}`)
}
