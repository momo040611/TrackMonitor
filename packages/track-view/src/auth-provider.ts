// 在真实环境中，如果使用firebase这种第三方auth服务的话，本文件不需要开发者开发

import type { User } from './types/user'
import { http } from './utils/http'

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
  return http('login', {
    method: 'POST',
    data,
  }).then(handleUserResponse)
}

export const register = (data: { username: string; password: string }): Promise<User | null> => {
  return http('register', {
    method: 'POST',
    data,
  }).then(handleUserResponse)
}

export const logout = async () => window.localStorage.removeItem(localStorageKey)

export const checkUsername = (username: string): Promise<void> => {
  return http('check-username', {
    method: 'POST',
    data: { username },
  })
}

export const getCurrentUser = (): Promise<User | null> => {
  const token = getToken()
  if (!token) {
    return Promise.resolve(null)
  }
  return http('me', {
    method: 'GET',
    token,
  })
    .then(handleUserResponse)
    .catch(() => {
      // 如果请求失败，清除 token 并返回 null
      window.localStorage.removeItem(localStorageKey)
      return null
    })
}
