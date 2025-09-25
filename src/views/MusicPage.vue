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
          class="parent-menu"
          :class="{ active: activeMenu === 'favorites' }"
          @click="toggleFavorites"
        >
          <div class="menu-item">
            <span class="menu-icon">❤️</span>
            <span class="menu-text">我的收藏</span>
            <span class="arrow">{{ isFavoritesExpanded ? '▼' : '▶' }}</span>
          </div>
          <!-- 动态歌单列表 -->
          <ul class="sub-menu" v-if="isFavoritesExpanded">
            <li
              v-for="playlist in playlists"
              :key="playlist.id"
              @click.stop="selectPlaylist(playlist)"
              :class="{ active: selectedPlaylistId === playlist.id }"
            >
              {{ playlist.name }}
            </li>
          </ul>
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
          <img :src="'/default-thumbnail.png' || 'https://via.placeholder.com/80'" :alt="music.title+'封面'"/>
          <div class="play-button" @click="handlePlayClick(music)">▶</div>
        </div>
        <div class="info">
          <div class="title">{{ music.title }}</div>
          <div class="artist">{{ music.artist }}</div>
          <div class="album">{{ music.album || '未知专辑' }}</div>
        </div>
        <div class="duration">{{ formatTime(music.duration) || '03:45' }}</div>
        <div class="actions">
          <button class="btn-icon like-btn">❤️</button>
          <button class="btn-icon more-btn" @click.stop="toggleCollectionMenu(music)">⋮</button>

          <!-- 收藏弹窗 -->
          <div v-if="collectionMenus[music.id]?.showMenu" class="collection-popup">
            <div class="collection-item"
                 @mouseenter="showCollectionsList(music.id, true)"
                 @mouseleave="showCollectionsList(music.id, false)">
              添加到收藏
              <div v-if="collectionMenus[music.id]?.showList" class="collections-list">
                <div v-for="collection in playlists" :key="collection.id" class="collection-option"
                     @click="addToCollection(collection.id, music.id)">
                  {{ collection.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- 移除这里的MusicPlayer组件，因为它现在在App.vue中全局显示 -->
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { addMusicToCollection, getAllCollections } from '@/api/music'
import { getAllMusic } from '@/api/music'
import { useMusicPlayerStore } from '@/stores/musicPlayer'

const playerStore = useMusicPlayerStore()

const activeMenu = ref('all')
const musicList = ref([])

// 新增状态
const isFavoritesExpanded = ref(false)
const playlists = ref([])
const selectedPlaylistId = ref(null)

const collectionMenus = ref({});

// 切换收藏菜单展开/折叠
const toggleFavorites = () => {
  isFavoritesExpanded.value = !isFavoritesExpanded.value
  if (isFavoritesExpanded.value) {
    loadPlaylists() // 展开时加载歌单
  }
}

// 加载歌单数据
const loadPlaylists = async () => {
  try {
    const response = await getAllCollections()
    // 假设后端返回格式: { id: string, name: string }[]
    playlists.value = response.data || []
  } catch (error) {
    console.error('加载歌单失败:', error)
    playlists.value = []
  }
}

// 选择歌单
const selectPlaylist = (playlist) => {
  selectedPlaylistId.value = playlist.id
  activeMenu.value = 'playlist'
  // 此处可添加加载选中歌单歌曲的逻辑
}

// 播放按钮点击事件处理函数
const handlePlayClick = (music) => {
  console.log('当前歌曲数据明细:', music);
  playerStore.loadSong(music)
}

// 在组件挂载时调用API获取所有音乐
onMounted(async () => {
  try {
    const response = await getAllMusic()
    musicList.value = response.data || []
    await loadPlaylists()
  } catch (error) {
    console.error('获取音乐列表失败:', error)
    musicList.value = []
  }
  await loadMusicData();
})

// 格式化时间为分:秒格式
const formatTime = (time) => {
  if (isNaN(time)) return '00:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const loadMusicData = async () => {
  try {
    let response;
    if (activeMenu.value === 'all') {
      response = await getAllMusic();
    } else {
      response = await getAllCollections();
    }
    musicList.value = response.data || [];
  } catch (error) {
    console.error('获取音乐数据失败:', error);
    musicList.value = [];
  }
};
watch(activeMenu, loadMusicData);

// 新增收藏相关方法
const toggleCollectionMenu = (music) => {
  if (!collectionMenus.value[music.id]) {
    collectionMenus.value[music.id] = { showMenu: true, showList: false }
  } else {
    collectionMenus.value[music.id].showMenu = !collectionMenus.value[music.id].showMenu
  }
}
const showCollectionsList = (musicId, show) => {
  if (collectionMenus.value[musicId]) {
    collectionMenus.value[musicId].showList = show
  }
}

// 添加到收藏
const addToCollection = async (collectionId, musicId) => {
  try {
    await addMusicToCollection(collectionId, musicId)
    alert('添加到收藏成功')
    // 关闭对应音乐弹窗
    if (collectionMenus.value[musicId]) {
      collectionMenus.value[musicId].showMenu = false
      collectionMenus.value[musicId].showList = false
    }
  } catch (error) {
    console.error('添加收藏失败:', error)
    alert('添加到收藏失败')
  }
}
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

/* 父菜单样式 */
.parent-menu {
  position: relative;
  padding-bottom: 5px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  font-size: 12px;
  margin-left: 8px;
}

/* 子菜单样式 */
.sub-menu {
  padding-left: 0; /* 去掉缩进 */
  background: transparent; /* 去掉背景色 */
  box-shadow: none; /* 去掉阴影 */
}

.sub-menu li {
  padding-left: 40px; /* 单个子项缩进，而不是整个ul缩进 */
}

.sub-menu li:hover {
  background: #e8f4fd; /* 悬停背景色 */
  color: #1a73e8; /* 悬停文字色 */
}

.sub-menu li.active {
  background: #e8f4fd;
  color: #1a73e8;
  font-weight: 500;
}

/* 关键修复：让带子菜单的父项纵向排布 */
.menu-list > li.parent-menu {
  display: flex; /* 覆盖掉通用 li 的 display:flex 行为 */
  flex-direction: column; /* 纵向堆叠 .menu-item 和 .sub-menu */
  align-items: stretch;
  padding: 0; /* 内边距交给 .menu-item 控制 */
}

/* 父项标题行仍然左右排布（图标-文字-箭头） */
.menu-list > li.parent-menu .menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
}

/* 子菜单占满宽度，改为自己纵向列表 */
.menu-list > li.parent-menu .sub-menu {
  width: 100%;
  padding-left: 0; /* 不需要让整个 ul 缩进 */
  margin: 0;
  background: transparent; /* 看你要不要背景 */
  box-shadow: none;
}

/* 子项本身做缩进，层级更清晰 */
.menu-list > li.parent-menu .sub-menu li {
  padding: 10px 24px 10px 48px;
}

/* 只高亮父项标题，不把整块 li（连同子菜单）都染色 */
.menu-list li.active {
  background: transparent;
  color: inherit;
}

.menu-list li.active > .menu-item {
  background: #e8f4fd;
  color: #1a73e8;
  position: relative;
}

.menu-list li.active > .menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.music-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
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
  background: rgba(0, 0, 0, 0.6);
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

.actions {
  display: flex;
  gap: 10px;
  position: relative; /* 添加相对定位，作为弹窗的定位容器 */
}

/* 收藏弹窗样式 */
.collection-popup {
  position: absolute;
  top: 30px; /* 固定在按钮下方 */
  right: 0; /* 右对齐按钮 */
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  z-index: 100;
  min-width: 150px; /* 固定最小宽度 */
}

.collection-item {
  padding: 8px 16px;
  cursor: pointer;
  position: relative;
}

.collection-item:hover {
  background: #f5f5f5;
}

.collections-list {
  position: absolute;
  top: 0;
  left: 100%; /* 固定在选项右侧 */
  margin-left: 5px; /* 微小间距避免重叠 */
  width: 200px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
}

.collection-option {
  padding: 8px 16px;
}

.collection-option:hover {
  background: #f0f0f0;
}
</style>
