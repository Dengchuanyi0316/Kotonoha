// src/api/music.js
import request from '@/utils/request'

const musicApi = {
  // 查询所有音乐
  getAllMusic() {
    return request.get('/music/all');
  },

  // 根据ID查询音乐
  getMusicById(id) {
    return request.get(`/music/${id}`);
  },

  // 添加音乐
  addMusic(musicData) {
    return request.post('/music/add', musicData);
  },

  // 修改音乐
  updateMusic(musicData) {
    return request.put('/music/update', musicData);
  },

  // 删除音乐
  deleteMusic(id) {
    return request.delete(`/music/delete/${id}`);
  }
};

export default musicApi;
