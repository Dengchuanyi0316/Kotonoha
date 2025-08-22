<template>
  <div class="music-page">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
      <div class="logo">
        <span class="icon">🎵</span>
        <span class="text">音乐云</span>
      </div>
      <ul class="menu-list">
        <li
          :class="{ active: activeMenu === 'all' }"
          @click="activeMenu = 'all'"
        >
          <span class="menu-icon">📋</span>
          <span class="menu-text">所有音乐</span>
        </li>
        <li
          :class="{ active: activeMenu === 'favorites' }"
          @click="activeMenu = 'favorites'"
        >
          <span class="menu-icon">❤️</span>
          <span class="menu-text">我的收藏</span>
        </li>
      </ul>
    </aside>

    <!-- 右侧歌曲列表 -->
    <main class="music-list">
      <div class="section-header">
        <h2>{{ activeMenu === 'all' ? '所有音乐' : '我的收藏' }}</h2>
        <div class="count">{{ musicList.length }} 首歌曲</div>
      </div>

      <div class="music-card" v-for="music in musicList" :key="music.id">
        <div class="cover">
          <img :src="'/default-thumbnail.png' || 'https://via.placeholder.com/80'" alt="{{ music.title }}封面"/>
          <div class="play-button">▶</div>
        </div>
        <div class="info">
          <div class="title">{{ music.title }}</div>
          <div class="artist">{{ music.artist }}</div>
          <div class="album">{{ music.album || '未知专辑' }}</div>
        </div>
        <div class="duration">{{ music.duration || '03:45' }}</div>
        <div class="actions">
          <button class="btn-icon like-btn">❤️</button>
          <button class="btn-icon more-btn">⋮</button>
        </div>
      </div>
    </main>

    <!-- 播放条 -->
    <MusicPlayer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MusicPlayer from '@/components/MusicPlayer.vue'

const activeMenu = ref('all')

// 模拟数据展示
const musicList = ref([
  { id: 1, title: '过火', artist: '张信哲', album: '宽容' },
  { id: 2, title: '若月亮没来', artist: '多人', album: '月光集' },
  { id: 3, title: '示例歌曲', artist: '歌手A', album: '示例专辑' },
  { id: 4, title: '示例歌曲2', artist: '歌手B', album: '示例专辑2' },
])
</script>

<style scoped>
.music-page {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 80px; /* 给底部播放器预留空间 */
  width: 80%;
  margin: 0 auto; /* 居中显示 */
}

/* 左侧菜单 - 提升质感 */
.sidebar {
  width: 240px; /* 加宽菜单 */
  background: #ffffff; /* 白色背景 */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05); /* 添加微妙阴影 */
  padding: 20px 0;
  flex-shrink: 0;
  border-radius: 0 12px 12px 0; /* 右侧圆角 */
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  padding: 0 20px 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.logo .icon {
  font-size: 24px;
  margin-right: 10px;
}

.logo .text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  cursor: pointer;
  transition: all 0.2s;
  color: #555;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 15px;
}

.menu-list li:hover {
  background: #f5f5f5;
}

.menu-list li.active {
  background: #e8f4fd;
  color: #1a73e8;
  position: relative;
}

.menu-list li.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #1a73e8;
}

/* 右侧歌曲列表 - 长条形竖向排列 */
.music-list {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  color: #222;
  margin: 0;
}

.count {
  color: #666;
  font-size: 14px;
}

/* 长条形音乐卡片 */
.music-card {
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.music-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

.cover {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.6);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.music-card:hover .play-button {
  opacity: 1;
}

.info {
  flex: 1;
  margin-left: 20px;
  min-width: 0;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #222;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.album {
  font-size: 12px;
  color: #999;
}

.duration {
  color: #999;
  font-size: 14px;
  margin-right: 20px;
  white-space: nowrap;
}

.actions {
  display: flex;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  margin-left: 16px;
  color: #666;
  transition: color 0.2s;
  padding: 6px;
  border-radius: 50%;
}

.btn-icon:hover {
  background-color: #f0f0f0;
  color: #1a73e8;
}

.btn-icon.like-btn:hover {
  color: #ff4d4f;
}
</style>
