<template>
  <header class="navbar">
    <div class="nav-inner">
      <div class="logo">
        <img src="/logo.png" alt="logo" />
        <span>MySite</span>
      </div>
      <nav class="nav-menu">
        <!-- 保留顶部导航或根据需要调整 -->
        <!-- 可以选择只保留一些快捷操作或搜索功能 -->
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  width: 100%; /* 确保撑满宽度 */
}

/* 移除可能干扰的样式 */
.navbar {
  position: sticky !important;
  inset: 0 0 auto 0 !important;
  flex-direction: row !important;
}

.nav-inner {
  margin: 0 auto;
  padding: 0.8rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  font-weight: bold;
  color: #00a1d6;
}

.logo img {
  height: 32px;
  margin-right: 10px;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-menu a {
  color: #ddd;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s, border-bottom 0.3s;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
}

.nav-menu a:hover {
  color: #00a1d6;
  border-bottom: 2px solid #00a1d6;
}

.nav-menu .active {
  color: #00a1d6;
  border-bottom: 2px solid #00a1d6;
}
</style>
