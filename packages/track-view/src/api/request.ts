// 导入基础的 HTTP 请求工具
import request from '../utils/request'
import type { ApiResponse, ErrorData } from '../types'

// 类型定义
interface LoginParams {
  username: string
  password: string
}

interface RegisterParams {
  username: string
  password: string
  email?: string
}

interface RefreshTokenParams {
  refreshToken: string
}

interface ApiParams {
  projectId: string
  timeRange: string
}

interface EventParams {
  projectId: string
  eventType: string
}

interface AnalyzeParams {
  time: string
  startTime?: string
  endTime?: string
}

interface EventData {
  event: string
  properties?: Record<string, unknown>
}

interface UserInfo {
  id: string
  username: string
}

interface PerformanceData {
  successCount: number
  totalCount: number
}

interface EventsData {
  events: Array<Record<string, unknown>>
}

interface BusinessAnalysisData {
  trends: Array<{
    date: string
    value: number
  }>
}

// API 接口定义
export const api = {
  // 认证相关接口
  login: (data: LoginParams) => {
    return request.post<ApiResponse<{ token: string; user: UserInfo }>>('/user/login', data)
  },

  register: (data: RegisterParams) => {
    return request.post<ApiResponse<{ userId: string }>>('/user/register', data)
  },

  checkUsername: (data: { username: string }) => {
    return request.post<ApiResponse<{ available: boolean }>>('/user/check-username', data)
  },

  refreshToken: (data: RefreshTokenParams) => {
    return request.post<ApiResponse<{ token: string }>>('/user/refresh', data)
  },

  getUserInfo: (id: string) => {
    return request.get<ApiResponse<UserInfo>>(`/user/${id}`)
  },

  getCurrentUser: () => {
    return request.get<ApiResponse<UserInfo>>('/auth/profile')
  },

  // 埋点数据网关接口
  uploadEvent: (data: EventData) => {
    return request.post<ApiResponse<{ eventId: string }>>('/gateway/event', data)
  },

  uploadEvents: (data: EventData[]) => {
    return request.post<ApiResponse<{ count: number }>>('/gateway/events', data)
  },

  getPerformanceData: (params?: ApiParams) => {
    return request.get<ApiResponse<PerformanceData>>('/gateway/getPerformance', { params })
  },

  getErrorData: (params?: ApiParams) => {
    return request.get<ApiResponse<ErrorData>>('/gateway/getError', { params })
  },

  getUserBehaviorData: (params?: ApiParams) => {
    return request.get<ApiResponse<EventsData>>('/gateway/getUserBehavior', { params })
  },

  getAllEvents: (params?: ApiParams) => {
    return request.get<ApiResponse<EventsData>>('/gateway/getAll', { params })
  },

  getCustomEvent: (params?: EventParams) => {
    return request.get<ApiResponse<Record<string, unknown>>>('/gateway/getEvent', { params })
  },

  getEventById: (id: string) => {
    return request.get<ApiResponse<Record<string, unknown>>>(`/gateway/getEventById?id=${id}`)
  },

  updateEvent: (data: Record<string, unknown>) => {
    return request.put<ApiResponse<{ success: boolean }>>('/gateway/updateEvent', data)
  },

  deleteEvent: (id: string) => {
    return request.delete<ApiResponse<{ success: boolean }>>(`/gateway/deleteEvent?id=${id}`)
  },

  // AI 分析接口
  analyzeAllEvents: (params?: AnalyzeParams) => {
    return request.get<ApiResponse<{ insights: string[] }>>('/ai/analyzeAll', { params })
  },

  analyzeErrorEvents: (params?: AnalyzeParams) => {
    return request.get<ApiResponse<{ errors: ErrorData['errors'] }>>('/ai/analyzeError', { params })
  },

  analyzeUserBehaviorEvents: (params?: AnalyzeParams) => {
    return request.get<ApiResponse<{ behaviors: string[] }>>('/ai/analyzeUserBehavior', { params })
  },

  analyzePerformanceEvents: (params?: AnalyzeParams) => {
    return request.get<ApiResponse<{ metrics: PerformanceData }>>('/ai/analyzePerformance', {
      params,
    })
  },

  // Processing 接口
  processEvent: (data: EventData) => {
    return request.post<ApiResponse<{ processed: boolean }>>('/processing/event', data)
  },

  // Business 接口
  getBusinessAnalysis: (params?: ApiParams) => {
    return request.get<ApiResponse<BusinessAnalysisData>>('/business/analysis', { params })
  },

  sendBusinessAlert: (data: { message: string; level: string }) => {
    return request.post<ApiResponse<{ alertId: string }>>('/business/alert', data)
  },

  getUserBehaviorAnalysis: (params?: ApiParams) => {
    return request.get<ApiResponse<{ analysis: string }>>('/business/user-behavior', { params })
  },

  // 数据分析相关接口
  getOverviewData: () => {
    return request.get<ApiResponse<EventsData>>('/gateway/getAll')
  },

  getTrendData: () => {
    return request.get<ApiResponse<BusinessAnalysisData['trends']>>('/gateway/getAll')
  },

  getTypeDistributionData: () => {
    return request.get<ApiResponse<{ types: Array<{ name: string; value: number }> }>>(
      '/gateway/getAll'
    )
  },

  getRealtimeData: () => {
    return request.get<ApiResponse<{ count: number }>>('/gateway/getAll')
  },

  // AI 查询接口
  sendAiQuery: (data: { query: string }) => {
    return request.post<
      ApiResponse<{
        response: string
        query: string
        timestamp: string
        parsedData: Record<string, unknown>
      }>
    >('/ai/query', data)
  },
}
