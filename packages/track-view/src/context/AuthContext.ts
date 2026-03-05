import React from 'react'
import type { User } from '../types'

interface AuthForm {
  username: string
  password: string
  email?: string
}

export const AuthContext = React.createContext<
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
