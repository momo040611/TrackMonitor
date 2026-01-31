import axios from 'axios'

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
  (res) => res.data,
  (err) => {
    console.log('请求错误：', err)
    return Promise.reject(err)
  }
)

export default request
