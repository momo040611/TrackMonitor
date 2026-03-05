import React, { useEffect } from 'react'
import type { ReactNode } from 'react'
import * as auth from '../auth-provider'
import { useAsync } from '../utils/use-async'
import type { User } from '../types'
import { AuthContext } from './AuthContext'
import './auth-context.css'

interface AuthForm {
  username: string
  password: string
  email?: string
}

const bootstrapUser = async () => {
  let user = null
  const token = auth.getToken()

  if (token) {
    try {
      user = await auth.getCurrentUser()
    } catch {
      auth.logout()
      user = null
    }
  }
  return user
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 使用真实后端接口的认证逻辑
  const { data: user, isLoading, isIdle, isError, run, setData: setUser } = useAsync<User | null>()

  const login = (form: AuthForm) => auth.login(form).then(setUser)
  const register = (form: AuthForm) => auth.register(form).then(setUser)
  const logout = () =>
    auth.logout().then(() => {
      setUser(null)
    })
  const checkUsername = (username: string) => auth.checkUsername(username)

  // 页面初次加载时执行状态拉取
  useEffect(() => {
    run(bootstrapUser())
  }, [run])

  // 根据认证状态渲染不同的 UI
  if (isIdle || isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-content">
          <div className="auth-loading-spinner"></div>
          <div className="auth-loading-text">加载中...</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return <div className="auth-error-container">登录状态已过期，请重新登录</div>
  }

  return (
    <AuthContext.Provider value={{ user: user || null, login, register, logout, checkUsername }}>
      {children}
    </AuthContext.Provider>
  )
}
