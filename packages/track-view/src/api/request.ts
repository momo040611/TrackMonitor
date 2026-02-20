// 导入基础的 HTTP 请求工具
import request from '../utils/request'

// API 接口定义
export const api = {
  // 认证相关接口
  login: (data: { username: string; password: string }) => {
    return request.post('/user/login', data)
  },

  register: (data: { username: string; password: string; email?: string }) => {
    return request.post('/user/register', data)
  },

  checkUsername: (data: { username: string }) => {
    return request.post('/user/check-username', data)
  },

  refreshToken: (data: any) => {
    return request.post('/user/refresh', data)
  },

  getUserInfo: (id: string) => {
    return request.get(`/user/${id}`)
  },

  getCurrentUser: () => {
    return request.get('/auth/profile')
  },

  // 埋点数据网关接口
  uploadEvent: (data: any) => {
    return request.post('/gateway/event', data)
  },

  uploadEvents: (data: any) => {
    return request.post('/gateway/events', data)
  },

  getPerformanceData: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/getPerformance', { params })
  },

  getErrorData: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/getError', { params })
  },

  getUserBehaviorData: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/getUserBehavior', { params })
  },

  getAllEvents: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/getAll', { params })
  },

  getCustomEvent: (params?: { projectId: string; eventType: string }) => {
    return request.get('/gateway/getEvent', { params })
  },

  getEventById: (id: string) => {
    return request.get(`/gateway/getEventById?id=${id}`)
  },

  updateEvent: (data: any) => {
    return request.put('/gateway/updateEvent', data)
  },

  deleteEvent: (id: string) => {
    return request.delete(`/gateway/deleteEvent?id=${id}`)
  },

  // AI 分析接口
  analyzeAllEvents: (params?: { time: string; startTime?: string; endTime?: string }) => {
    return request.get('/ai/analyzeAll', { params })
  },

  analyzeErrorEvents: (params?: { time: string; startTime?: string; endTime?: string }) => {
    return request.get('/ai/analyzeError', { params })
  },

  analyzeUserBehaviorEvents: (params?: { time: string; startTime?: string; endTime?: string }) => {
    return request.get('/ai/analyzeUserBehavior', { params })
  },

  analyzePerformanceEvents: (params?: { time: string; startTime?: string; endTime?: string }) => {
    return request.get('/ai/analyzePerformance', { params })
  },

  // Processing 接口
  processEvent: (data: any) => {
    return request.post('/processing/event', data)
  },

  // Business 接口
  getBusinessAnalysis: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/business/analysis', { params })
  },

  sendBusinessAlert: (data: any) => {
    return request.post('/business/alert', data)
  },

  getUserBehaviorAnalysis: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/business/user-behavior', { params })
  },

  // 数据分析相关接口
  getOverviewData: () => {
    return request.get('/gateway/getAll')
  },

  getTrendData: () => {
    return request.get('/gateway/getAll')
  },

  getTypeDistributionData: () => {
    return request.get('/gateway/getAll')
  },

  getRealtimeData: () => {
    return request.get('/gateway/getAll')
  },
}
