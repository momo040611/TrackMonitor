import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 将超时时间从 5 秒增加到 30 秒
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
    // 使用更安全的 ASCII 字符检查，避免控制字符
    if (token && typeof token === 'string' && /^[\x20-\x7E]*$/.test(token)) {
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

export default request
