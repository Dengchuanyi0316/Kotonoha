import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    // 自动导入 Vue API（比如 ref、watch 等）
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue'], // 默认也会引入 vue 的 API
      dts: 'src/auto-imports.d.ts', // 可选：生成 TypeScript 提示
    }),

    // 自动注册组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts', // 可选：生成 TS 类型声明
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
