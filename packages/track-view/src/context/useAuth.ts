import React from 'react'

// AuthContext 在 AuthContext.ts 中定义，这里只导入使用
import { AuthContext } from './AuthContext'

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth必须在AuthProvider中使用')
  }
  return context
}
