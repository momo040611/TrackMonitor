export interface User {
  id: string
  username: string
  token: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message?: string
  user?: User
  data?: T
}
