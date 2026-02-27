import React, { useEffect } from 'react'
import type { ReactNode } from 'react'
import * as auth from '../auth-provider'
import { useAsync } from '../utils/use-async'
import type { User } from '../types'

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
    } catch (error) {
      auth.logout()
      user = null
    }
  }
  return user
}

const AuthContext = React.createContext<
  | {
      user: User | null
      register: (form: AuthForm) => Promise<void>
      login: (form: AuthForm) => Promise<void>
      logout: () => Promise<void>
      checkUsername: (username: string) => Promise<void>
    }
  | undefined
>(undefined)

AuthContext.displayName = 'AuthContext'

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3385ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px',
            }}
          ></div>
          <div style={{ fontSize: '16px', color: '#333' }}>加载中...</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'red',
        }}
      >
        登录状态已过期，请重新登录
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user: user || null, login, register, logout, checkUsername }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth必须在AuthProvider中使用')
  }
  return context
}
