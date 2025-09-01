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

// 收藏相关接口
// 添加收藏
export function addCollection(collectionData) {
  return request.post('/collections', collectionData);
}

// 删除收藏
export function deleteCollection(id) {
  return request.delete(`/collections/${id}`);
}

// 更新收藏
export function updateCollection(collectionData) {
  return request.put('/collections', collectionData);
}

// 查询单个收藏
export function getCollectionById(id) {
  return request.get(`/collections/${id}`);
}

// 查询所有收藏
export function getAllCollections() {
  return request.get('/collections');
}

// 根据用户ID查询收藏列表
export function getCollectionsByUserId(userId) {
  return request.get(`/collections/user/${userId}`);
}

// 添加音乐到收藏
export function addMusicToCollection(collectionId, musicId) {
  return request.post(`/collections/${collectionId}/music/${musicId}`);
}

// 从收藏中移除音乐
export function removeMusicFromCollection(collectionId, musicId) {
  return request.delete(`/collections/${collectionId}/music/${musicId}`);
}


