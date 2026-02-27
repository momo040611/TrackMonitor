import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前启动模式加载对应的环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 判断环境变量 VITE_USE_MOCK 是否等于 'true'
  const isMockEnabled = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      react(),
      // 动态控制 Mock 服务的开启/关闭
      viteMockServe({
        mockPath: './src/mock',
        enable: isMockEnabled,
      }),
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
        // API 接口代理
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // 认证相关接口代理
        '/user': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // 性能和错误事件接口代理
        '/gateway': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // AI 分析接口代理
        '/ai': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // 事件处理接口代理
        '/processing': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // 业务相关接口代理
        '/business': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        // 认证相关接口代理
        '/auth': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
