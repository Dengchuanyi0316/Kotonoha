<!-- src/App.vue -->
<template>
  <div class="app-container">
    <SideBar />
    <div class="main-content">
      <NavBar />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
  <MusicPlayer />
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'
import MusicPlayer from './components/MusicPlayer.vue'
</script>

<style>
/* 全局重置，保持你原有样式 */
html, body , #app{
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Segoe UI', sans-serif;
  background: #f8f8f8;
}

/* 让根容器撑满屏幕高度 */
#app {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 占满视口高度 */
}

.app-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 80px); /* 减去音乐播放器的高度 */
}

.main-content {
  flex: 1;
  margin-left: 220px; /* 侧边栏宽度 */
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* 让 NavBar 固定在顶部，宽度撑满 */
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* 置顶 */
  background-color: #34495e; /* 或你 NavBar 的背景色 */
}

/* 给 main 留出顶部空间，避免被 NavBar 遮挡 */
main {
  margin-top: 60px; /* 这个高度根据你 NavBar 实际高度调整 */
  padding: 2rem;
  flex: 1; /* 剩余空间全部占满 */
  overflow-y: auto; /* 内容溢出时滚动 */
  box-sizing: border-box; /* 确保padding不会增加元素宽度 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-220px);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
