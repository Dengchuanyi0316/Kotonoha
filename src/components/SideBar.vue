<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    <div class="sidebar-toggle" @click="toggleSidebar">
      <HiddenIcon class="toggle-icon" :class="{ 'rotate': !isCollapsed }" />
    </div>
    <nav class="sidebar-nav">
      <RouterLink to="/" exact-active-class="active" class="nav-item">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
        </span>
        <span class="nav-text" v-if="!isCollapsed">首页</span>
      </RouterLink>
      <RouterLink to="/editor" exact-active-class="active" class="nav-item">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>
        </span>
        <span class="nav-text" v-if="!isCollapsed">笔记</span>
      </RouterLink>
      <RouterLink to="/resources" exact-active-class="active" class="nav-item">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>
        </span>
        <span class="nav-text" v-if="!isCollapsed">资源</span>
      </RouterLink>
      <RouterLink to="/music" exact-active-class="active" class="nav-item">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        </span>
        <span class="nav-text" v-if="!isCollapsed">音乐</span>
      </RouterLink>
      <RouterLink to="/test" exact-active-class="active" class="nav-item">
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm-1-13h2v6h-2V5zm0 8h2v2h-2v-2z"/></svg>
        </span>
        <span class="nav-text" v-if="!isCollapsed">测试</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import HiddenIcon from './icons/HiddenIcon.vue'

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 2px 0 4px rgba(0,0,0,0.2);
  transition: width 0.3s ease;
  z-index: 999;
  width: 220px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-toggle {
  position: absolute;
  right: -15px;
  top: 20px;
  width: 30px;
  height: 30px;
  background: rgba(33, 33, 33, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 10;
}

.toggle-icon {
  color: #ddd;
  transition: transform 0.3s ease;
  width: 16px;
  height: 16px;
}

.toggle-icon.rotate {
  transform: rotate(180deg);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  margin-top: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ddd;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
}

.nav-item.active {
  background: rgba(0, 161, 214, 0.1);
  color: #00a1d6;
  border-left-color: #00a1d6;
}

.nav-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar.collapsed .nav-icon {
  margin-right: 0;
}

.nav-text {
  white-space: nowrap;
}

/* 为页面内容留出空间 */
.main-content {
  transition: margin-left 0.3s ease;
  margin-left: 220px;
}

.sidebar.collapsed + .main-content {
  margin-left: 60px;
}
</style>
