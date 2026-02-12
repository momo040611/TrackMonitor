import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 禁用mock服务，使用真实后端接口
    // viteMockServe({
    //   mockPath: './src/mock',
    //   enable: true,
    // }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 认证相关接口代理
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 性能和错误事件接口代理
      '/gateway': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 事件处理接口代理
      '/processing': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 业务相关接口代理
      '/business': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // AI 相关接口代理（如果后端提供）
      '/api/ai': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
