// 在真实环境中，如果使用firebase这种第三方auth服务的话，本文件不需要开发者开发

import type { User } from './types'
import { api } from './api/request'

const localStorageKey = '__auth_provider_token__'

export const getToken = () => window.localStorage.getItem(localStorageKey)

export const getUser = (): User | null => {
  const token = getToken()
  if (token) {
    try {
      const userData = JSON.parse(window.localStorage.getItem(token) || '{}')
      if (userData && userData.id && userData.username && userData.token) {
        return userData
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }
  return null
}

export const handleUserResponse = (response: any) => {
  let user: User | undefined

  // 处理不同格式的响应
  if (!response) {
    throw new Error('Invalid user response')
  }

  // 格式1: { user: User }
  if ('user' in response) {
    user = response.user
  }
  // 格式2: User
  else if ('id' in response && 'username' in response && 'token' in response) {
    user = response
  }
  // 格式3: { code: 200, user: User }
  else if ('code' in response && 'user' in response) {
    user = response.user
  }
  // 格式4: { code: 200, data: { user: User } }
  else if ('code' in response && 'data' in response && 'user' in response.data) {
    user = response.data.user
  }

  if (!user || !user.token) {
    throw new Error('Invalid user response')
  }
  window.localStorage.setItem(localStorageKey, user.token)
  return user
}

export const login = (data: { username: string; password: string }): Promise<User | null> => {
  return api.login(data).then(handleUserResponse)
}

export const register = (data: { username: string; password: string }): Promise<User | null> => {
  return api.register(data).then(handleUserResponse)
}

export const logout = async () => window.localStorage.removeItem(localStorageKey)

export const checkUsername = (username: string): Promise<void> => {
  // 暂时返回一个成功的Promise，因为真实后端接口中没有这个接口
  // 实际项目中，后端需要添加专门的用户名检查接口
  return Promise.resolve()
}

// 添加 getCurrentUser 函数的导出
export const getCurrentUser = (): Promise<User | null> => {
  const token = getToken()
  if (!token) {
    return Promise.resolve(null)
  }
  // 使用 /user/{id} 接口获取当前用户信息
  // 这里假设从 token 中解析出用户 ID，或者使用默认 ID
  const userId = '1' // 实际项目中应该从 token 中解析
  return api
    .getUserInfo(userId)
    .then(handleUserResponse)
    .catch(() => {
      // 如果请求失败，清除 token 并返回 null
      window.localStorage.removeItem(localStorageKey)
      return null
    })
}

// 为了兼容性，也导出 getCurrentUser 作为默认导出的属性
const authProvider = {
  getToken,
  getUser,
  handleUserResponse,
  login,
  register,
  logout,
  checkUsername,
  getCurrentUser,
}

export default authProvider
