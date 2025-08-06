import './assets/main.css'
// import 'quill/dist/quill.snow.css'

// 导入 Font Awesome 样式
import '@fortawesome/fontawesome-free/css/all.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())// 安装 Pinia 状态管理
app.use(router)// 安装 Vue Router

app.mount('#app')// 挂载到 index.html 中的 <div id="app"></div>
