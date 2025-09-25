<!-- src/App.vue -->
<template>
  <NavBar />
<!--  <main class="page-container">-->
<!--    <RouterView />-->
<!--  </main>-->
  <RouterView />
  <MusicPlayer />
</template>

<script setup>
import NavBar from './components/NavBar.vue'
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
  align-items: center;
}

/* 让 NavBar 固定在顶部，宽度撑满 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000; /* 置顶 */
  background-color: #34495e; /* 或你 NavBar 的背景色 */
}

/* 给 main 留出顶部空间，避免被 NavBar 和 MusicPlayer遮挡 */
.page-container {
  margin-top: 60px; /* 这个高度根据你 NavBar 实际高度调整 */
  margin-bottom: 100px; /* 添加底部边距，避免被播放条遮挡 */
  padding: 2rem;
  flex: 1; /* 剩余空间全部占满 */
  overflow-y: auto; /* 内容溢出时滚动 */
  width: 100%;
  box-sizing: border-box; /* 确保padding不会增加元素宽度 */
}
</style>
