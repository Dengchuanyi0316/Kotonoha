// src/router/index.ts
// 这个文件配置了 Vue 应用的路由规则，使得应用能依据不同 URL 显示对应的页面组件。
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Editor from '../views/NoteEditor.vue'
import Resources from '../views/Resources.vue'
import About from '../views/AboutView.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/editor', component: Editor },
  { path: '/resources', component: Resources },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
