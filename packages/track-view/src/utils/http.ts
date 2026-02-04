import qs from 'qs'
import * as auth from '../auth-provider'
import { useAuth } from '../context/auth-context'
import { useCallback } from 'react'

const apiUrl = import.meta.env.VITE_API_URL || '/api'

interface Config extends RequestInit {
  token?: string
  data?: object
}

export const http = async (
  endpoint: string,
  { data, token, headers, ...customConfig }: Config = {}
) => {
  const config = {
    method: 'GET',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': data ? 'application/json' : '',
    },
    ...customConfig,
  }

  if (config.method.toUpperCase() === 'GET') {
    endpoint += `?${qs.stringify(data)}`
  } else {
    config.body = JSON.stringify(data || {})
  }

  // axios 和 fetch 的表现不一样，axios可以直接在返回状态不为2xx的时候抛出异常
  return window.fetch(`${apiUrl}/${endpoint}`, config).then(async (response) => {
    let data
    try {
      data = await response.json()
    } catch (e) {
      data = null
    }

    // 检查是否是错误响应
    if (!response.ok) {
      // 对于登录和注册请求，任何错误状态码都不刷新页面
      if (endpoint === 'login' || endpoint === 'register') {
        // 确保错误对象包含message属性
        if (data && typeof data === 'object') {
          if ('message' in data) {
            return Promise.reject(data)
          } else if ('error' in data) {
            return Promise.reject({ message: data.error })
          } else {
            // 处理 { code: 401, ... } 或 { status: 401, ... } 格式的错误
            const statusCode = 'status' in data ? data.status : 'code' in data ? data.code : 200
            if (statusCode !== 200) {
              return Promise.reject({ message: data.message || '用户名或密码错误' })
            }
          }
        }
        return Promise.reject({ message: '请求失败，请稍后重试' })
      }

      // 对于其他请求，401错误刷新页面
      if (response.status === 401) {
        await auth.logout()
        window.location.reload()
        return Promise.reject({ message: '请重新登录' })
      }

      // 确保错误对象包含message属性
      if (data && typeof data === 'object') {
        if ('message' in data) {
          return Promise.reject(data)
        } else if ('error' in data) {
          return Promise.reject({ message: data.error })
        }
      }

      return Promise.reject({ message: '请求失败，请稍后重试' })
    }

    // 处理成功响应，但检查是否包含业务错误
    if (data && typeof data === 'object') {
      // 检查是否是业务错误（状态码是200，但包含错误信息）
      // 同时支持code和status字段
      const statusCode = 'status' in data ? data.status : 'code' in data ? data.code : 200
      if (statusCode !== 200) {
        // 对于登录和注册请求，业务错误不刷新页面
        if (endpoint === 'login' || endpoint === 'register') {
          if ('message' in data) {
            return Promise.reject(data)
          } else if ('error' in data) {
            return Promise.reject({ message: data.error })
          } else {
            return Promise.reject({ message: '用户名或密码错误' })
          }
        }

        // 对于其他请求，业务错误直接返回
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
  })
}
// 自定义 hook，用于发起 HTTP 请求
export const useHttp = () => {
  const { user } = useAuth()
  return useCallback(
    (...[endpoint, config]: Parameters<typeof http>) =>
      http(endpoint, { ...config, token: user?.token }),
    [user?.token]
  )
}
