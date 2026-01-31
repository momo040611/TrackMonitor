// 在真实环境中，如果使用firebase这种第三方auth服务的话，本文件不需要开发者开发

import type { User } from './types/user'

// 本地 mock 数据
const mockUsers = [
  { id: '1', username: 'admin', password: '123456', token: 'mock-token-admin' },
  { id: '2', username: 'test', password: '123456', token: 'mock-token-test' },
]

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

export const handleUserResponse = (response: { user: User | undefined } | User) => {
  let user: User | undefined
  if ('user' in response) {
    user = response.user
  } else {
    user = response
  }
  if (!user || !user.token) {
    throw new Error('Invalid user response')
  }
  window.localStorage.setItem(localStorageKey, user.token)
  return user
}

export const login = (data: { username: string; password: string }): Promise<User | null> => {
  // 使用本地 mock 数据
  return new Promise((resolve, reject) => {
    const { username, password } = data
    const user = mockUsers.find((u) => u.username === username && u.password === password)

    if (user) {
      window.localStorage.setItem(localStorageKey, user.token)
      resolve(user)
    } else {
      reject({ message: '用户名或密码错误' })
    }
  })
}

export const register = (data: { username: string; password: string }): Promise<User | null> => {
  // 使用本地 mock 数据
  return new Promise((resolve, reject) => {
    const { username, password } = data
    const existingUser = mockUsers.find((u) => u.username === username)

    if (existingUser) {
      reject({ message: '用户名已存在' })
    } else {
      const newUser = {
        id: Date.now().toString(36),
        username,
        password,
        token: `mock-token-${Date.now()}`,
      }
      mockUsers.push(newUser)
      window.localStorage.setItem(localStorageKey, newUser.token)
      resolve(newUser)
    }
  })
}

export const logout = async () => window.localStorage.removeItem(localStorageKey)

export const checkUsername = (username: string): Promise<void> => {
  // 使用本地 mock 数据
  return new Promise((resolve, reject) => {
    const existingUser = mockUsers.find((u) => u.username === username)

    if (existingUser) {
      reject({ message: '用户名已存在' })
    } else {
      resolve()
    }
  })
}

export const getCurrentUser = (): Promise<User | null> => {
  const token = getToken()
  if (!token) {
    return Promise.resolve(null)
  }
  // 使用本地 mock 数据
  return new Promise((resolve, reject) => {
    const user = mockUsers.find((u) => u.token === token)

    if (user) {
      resolve(user)
    } else {
      // 如果找不到用户，清除 token 并返回 null
      window.localStorage.removeItem(localStorageKey)
      resolve(null)
    }
  })
}
