export interface User {
  id: string
  username: string
  token: string
}

// 错误项类型
export interface ErrorItem {
  message: string
  stack?: string
}

// 错误数据类型
export interface ErrorData {
  errors: ErrorItem[]
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message?: string
  user?: User
  data?: T
}
