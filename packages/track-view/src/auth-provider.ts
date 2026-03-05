// 在真实环境中，如果使用firebase这种第三方auth服务的话，本文件不需要开发者开发

import type { User } from './types'
import type { ApiResponse } from './types'
import { api } from './api/request'

const localStorageKey = '__auth_provider_token__'

export const getToken = () => window.localStorage.getItem(localStorageKey)

export const getUser = (): User | null => {
  const token = getToken()
  if (token) {
    try {
      const userData = JSON.parse(window.localStorage.getItem(token) || '{}')
      if (userData && userData.id && userData.username && userData.token) {
        return userData as User
      }
    } catch {
      // 解析失败返回 null
    }
  }
  return null
}

// API 响应数据结构
interface AuthResponse {
  data?: {
    access_token?: string
    token?: string
    user?: User
  }
  access_token?: string
  token?: string
  user?: User
  message?: string
}

// 用户数据接口
interface UserData {
  id?: string | number
  username?: string
  [key: string]: unknown
}

export const handleUserResponse = (response: ApiResponse<AuthResponse> | AuthResponse | null) => {
  if (!response) {
    throw new Error('未收到服务器响应，登录失败')
  }

  const authResponse = response as AuthResponse
  const token =
    authResponse.data?.access_token ||
    authResponse.access_token ||
    authResponse.data?.token ||
    authResponse.token
  const userData = (authResponse.data?.user ||
    authResponse.user ||
    authResponse.data ||
    authResponse) as UserData | undefined

  if (!token) {
    throw new Error(authResponse.message || '登录失败，未获取到访问令牌')
  }

  const user: User = {
    id: String(userData?.id || 'unknown'),
    username: String(userData?.username || 'user'),
    token: token,
  }

  window.localStorage.setItem(localStorageKey, token)
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
  return api
    .register(data)
    .then((response: ApiResponse<AuthResponse> | AuthResponse): Promise<User | null> => {
      const authResponse = response as AuthResponse
      const token =
        authResponse.data?.access_token ||
        authResponse.access_token ||
        authResponse.data?.token ||
        authResponse.token

      if (token) {
        // 如果给了 Token，直接走正常解析逻辑
        return Promise.resolve(handleUserResponse(response))
      } else {
        // 没 Token，拿账号密码自动调一次登录接口
        return login({ username: data.username, password: data.password })
      }
    })
    .catch((error: { response?: { data?: { message?: string } }; message?: string }) => {
      throw new Error(error?.response?.data?.message || error?.message || '注册失败，请稍后重试')
    })
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
export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken()
  if (!token || token === 'undefined') {
    window.localStorage.removeItem(localStorageKey)
    return null
  }

  // 提前准备好本地缓存数据
  const localUserStr = window.localStorage.getItem(token)
  const localUser: User | null = localUserStr ? JSON.parse(localUserStr) : null
  const userId = localUser?.id || '1'

  try {
    let response
    try {
      response = await api.getUserInfo(userId)
    } catch {
      response = await api.getCurrentUser()
    }

    const userData = response?.data?.user || response?.data?.data || response?.data

    if (!userData || !('username' in userData) || !userData.username) {
      throw new Error('获取用户信息失败')
    }

    const user: User = {
      id: userData.id?.toString() || 'unknown',
      username: userData.username,
      token: token,
    }

    // 更新鲜活的缓存
    window.localStorage.setItem(user.token, JSON.stringify(user))
    return user
  } catch {
    if (localUser && localUser.username) {
      // API 拉取失败，使用本地缓存保底
      return localUser
    }
    window.localStorage.removeItem(localStorageKey)
    return null
  }
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
