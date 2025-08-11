import request from '@/utils/request';

// 获取所有笔记
export function fetchNotes() {
  return request.get('/notes');
}

// 获取单个笔记
export function getNote(id) {
  return request.get(`/notes/${id}`);
}

// 创建新笔记
export function createNote(data) {
  return request.post('/notes', data);
}

// 更新笔记
export function updateNote(id, data) {
  return request.put(`/notes/${id}`, data);
}

// 删除笔记
export function deleteNote(id) {
  return request.delete(`/notes/${id}`);
}
