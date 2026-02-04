import axios from 'axios'
import * as auth from '../auth-provider'
import { useCallback } from 'react'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // 使用环境变量或默认值
  timeout: 5000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('__auth_provider_token__')
    // 如果有 token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (res) => {
    const data = res.data
    // 处理成功响应，但检查是否包含业务错误
    if (data && typeof data === 'object') {
      // 检查是否是业务错误（状态码是200，但包含错误信息）
      // 同时支持code和status字段
      const statusCode = 'status' in data ? data.status : 'code' in data ? data.code : 200
      if (statusCode !== 200) {
        // 确保错误对象包含message属性
        if ('message' in data) {
          return Promise.reject(data)
        } else if ('error' in data) {
          return Promise.reject({ message: data.error })
        } else {
          return Promise.reject({ message: '请求失败，请稍后重试' })
        }
      }
    }
    return data
  },
  (err) => {
    console.log('请求错误：', err)
    const response = err.response

    // 处理HTTP错误状态码
    if (response) {
      // 对于401错误，清除token并刷新页面
      if (response.status === 401) {
        auth.logout()
        window.location.reload()
        return Promise.reject({ message: '请重新登录' })
      }

      // 处理其他错误状态码
      const data = response.data
      if (data && typeof data === 'object') {
        if ('message' in data) {
          return Promise.reject(data)
        } else if ('error' in data) {
          return Promise.reject({ message: data.error })
        }
      }
    }

    return Promise.reject({ message: '请求失败，请稍后重试' })
  }
)

// 自定义 hook，用于发起 HTTP 请求
export const useHttp = () => {
  return useCallback((endpoint: string, config: Record<string, unknown> = {}) => {
    // 构建请求配置
    const axiosConfig: Record<string, unknown> = {
      url: endpoint,
      ...config,
    }

    // 如果提供了token，使用它覆盖默认的token
    if (config.token) {
      axiosConfig.headers = {
        ...(axiosConfig.headers as Record<string, string>),
        Authorization: `Bearer ${config.token}`,
      }
    }

    return request(axiosConfig as any)
  }, [])
}

export default request
