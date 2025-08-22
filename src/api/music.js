// src/api/music.js
import request from '@/utils/request'

// 查询所有音乐
export function getAllMusic() {
  return request.get('/music/all');
}

// 根据ID查询音乐
export function getMusicById(id) {
  return request.get(`/music/${id}`);
}

// 添加音乐
export function addMusic(musicData) {
  return request.post('/music/add', musicData);
}

// 修改音乐
export function updateMusic(musicData) {
  return request.put('/music/update', musicData);
}

// 删除音乐
export function deleteMusic(id) {
  return request.delete(`/music/delete/${id}`);
}
