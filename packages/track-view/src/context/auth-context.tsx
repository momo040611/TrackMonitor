import React, { useEffect } from 'react'
import type { ReactNode } from 'react'
import * as auth from '../auth-provider'
import { useAsync } from '../utils/use-async'
import type { User } from '../types/user'

interface AuthForm {
  username: string
  password: string
}

const bootstrapUser = async () => {
  let user = null
  const token = auth.getToken()
  if (token) {
    try {
      const result = (await auth.getCurrentUser?.()) ?? null
      user = result
    } catch (error) {
      console.log('Bootstrap user error:', error)
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
  const { data: user, isLoading, isIdle, isError, run, setData: setUser } = useAsync<User | null>()

  // point free
  const login = (form: AuthForm) => auth.login(form).then(setUser)
  const register = (form: AuthForm) => auth.register(form).then(setUser)
  const logout = () =>
    auth.logout().then(() => {
      setUser(null)
    })
  const checkUsername = (username: string) => auth.checkUsername(username)

  useEffect(() => {
    run(bootstrapUser())
  }, [run])

  if (isIdle || isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        加载中...
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
        加载失败
      </div>
    )
  }

  return (
    <AuthContext.Provider
      children={children}
      value={{ user: user || null, login, register, logout, checkUsername }}
    />
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth必须在AuthProvider中使用')
  }
  return context
}
