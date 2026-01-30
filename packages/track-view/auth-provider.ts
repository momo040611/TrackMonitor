// 在真实环境中，如果使用firebase这种第三方auth服务的话，本文件不需要开发者开发

import type { User } from './src/types/user'

const localStorageKey = '__auth_provider_token__'
const localStorageUserKey = '__auth_provider_user__'

export const getToken = () => window.localStorage.getItem(localStorageKey)

export const getUser = () => {
  const userJson = window.localStorage.getItem(localStorageUserKey)
  return userJson ? JSON.parse(userJson) : null
}

export const handleUserResponse = ({ user }: { user: User }) => {
  window.localStorage.setItem(localStorageKey, user.token || '')
  window.localStorage.setItem(localStorageUserKey, JSON.stringify(user))
  return user
}

// 模拟登录功能
export const login = (data: { username: string; password: string }) => {
  // 模拟网络延迟
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟验证
      if (data.username && data.password) {
        // 模拟成功响应
        const user: User = {
          id: '1',
          username: data.username,
          token: `mock-token-${Date.now()}`,
        }
        resolve({ user })
      } else {
        // 模拟失败响应
        reject({ message: '用户名或密码不能为空' })
      }
    }, 500)
  }).then((response: any) => {
    return handleUserResponse(response)
  })
}

// 模拟注册功能
export const register = (data: { username: string; password: string }) => {
  // 模拟网络延迟
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟验证
      if (data.username && data.password) {
        // 模拟成功响应
        const user: User = {
          id: `user-${Date.now()}`,
          username: data.username,
          token: `mock-token-${Date.now()}`,
        }
        resolve({ user })
      } else {
        // 模拟失败响应
        reject({ message: '用户名或密码不能为空' })
      }
    }, 500)
  }).then((response: any) => {
    return handleUserResponse(response)
  })
}

export const logout = async () => {
  window.localStorage.removeItem(localStorageKey)
  window.localStorage.removeItem(localStorageUserKey)
}
