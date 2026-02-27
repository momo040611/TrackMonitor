import axios from 'axios'
import { useCallback } from 'react'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  // 明确指定 200-299 之间的状态码为成功响应
  validateStatus: (status) => {
    return status >= 200 && status < 300
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token
    const token = localStorage.getItem('__auth_provider_token__')
    // 如果有 token，添加到请求头
    if (token && typeof token === 'string' && /^[\x00-\x7F]*$/.test(token)) {
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
    if (typeof data === 'string' && data.trim().startsWith('<')) {
      return Promise.reject({ message: '接口返回了非法的HTML格式 (代理失败或路由回退)' })
    }
    return data
  },
  (err) => {
    const response = err.response

    // 处理HTTP错误状态码
    if (response) {
      // 处理401错误（用户名或密码错误）
      if (response.status === 401) {
        return Promise.reject({ message: '用户名或密码错误' })
      }

      // 处理其他错误状态码
      const data = response.data
      if (data && typeof data === 'object') {
        if ('message' in data) {
          return Promise.reject(data)
        } else if ('error' in data) {
          return Promise.reject({ message: data.error })
        } else if ('statusCode' in data) {
          return Promise.reject({ message: data.message || '服务器内部错误' })
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
