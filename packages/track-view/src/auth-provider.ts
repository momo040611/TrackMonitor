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
    } catch (error) {}
  }
  return null
}

export const handleUserResponse = (response: any) => {
  if (!response) {
    throw new Error('未收到服务器响应，登录失败')
  }
  const token =
    response?.data?.access_token ||
    response?.access_token ||
    response?.data?.token ||
    response?.token
  const userData = response?.data?.user || response?.user || response?.data || response

  if (!token) {
    throw new Error(response?.message || '登录失败，未获取到访问令牌')
  }

  const user: User = {
    id: userData?.id?.toString() || 'unknown',
    username: userData?.username || 'user',
    token: token,
  }

  window.localStorage.setItem(localStorageKey, userData.token)
  window.localStorage.setItem(user.token, JSON.stringify(user))
  return user
}

export const login = (data: { username: string; password: string }): Promise<User | null> => {
  return api
    .login(data)
    .then(handleUserResponse)
    .catch((error) => {
      // 处理登录错误
      throw new Error(
        error?.response?.data?.message || error?.message || '账号或密码错误，登录失败'
      )
    })
}

export const register = (data: {
  username: string
  password: string
  email?: string
}): Promise<User | null> => {
  return api.register(data).then(handleUserResponse)
}

export const logout = async () => window.localStorage.removeItem(localStorageKey)

export const checkUsername = (username: string): Promise<void> => {
  return api
    .checkUsername({ username })
    .then((response) => {
      // 检查后端返回的响应
      if (response.status === 200 || response.status === 0) {
        // 用户名可用
        return Promise.resolve()
      } else {
        // 用户名不可用
        throw new Error('用户名已存在')
      }
    })
    .catch(() => {
      // 抛出错误，让前端处理
      throw new Error('检查用户名失败，请稍后重试')
    })
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
