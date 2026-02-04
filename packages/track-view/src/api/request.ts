// 导入基础的 HTTP 请求工具
import request from '../utils/request'

// API 接口定义
export const api = {
  // 获取全局概览数据
  getOverviewData: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/analytics/overview', { params })
  },

  // 获取趋势数据
  getTrendData: (params?: { projectId: string; timeRange: string; metrics: string[] }) => {
    return request.get('/analytics/trend', { params })
  },

  // 获取类型分布数据
  getTypeDistributionData: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/analytics/type-distribution', { params })
  },

  // 获取热门埋点数据
  getTopTrackingData: (params?: { projectId: string; timeRange: string; limit: number }) => {
    return request.get('/analytics/top-tracking', { params })
  },

  // 获取转化漏斗数据
  getFunnelData: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/analytics/funnel', { params })
  },

  // 获取实时上报数据
  getRealtimeData: (params?: { projectId: string }) => {
    return request.get('/analytics/realtime', { params })
  },

  // 获取埋点配置列表
  getTrackingList: (params?: { projectId: string; type?: string; status?: string }) => {
    return request.get('/tracking/list', { params })
  },

  // 获取埋点详情
  getTrackingDetail: (id: string) => {
    return request.get(`/tracking/detail/${id}`)
  },

  // 创建埋点
  createTracking: (data: any) => {
    return request.post('/tracking/create', data)
  },

  // 更新埋点
  updateTracking: (id: string, data: any) => {
    return request.put(`/tracking/update/${id}`, data)
  },

  // 删除埋点
  deleteTracking: (id: string) => {
    return request.delete(`/tracking/delete/${id}`)
  },

  // 发布埋点
  publishTracking: (id: string) => {
    return request.post(`/tracking/publish/${id}`)
  },

  // 失效埋点
  disableTracking: (id: string) => {
    return request.post(`/tracking/disable/${id}`)
  },

  // 恢复埋点
  enableTracking: (id: string) => {
    return request.post(`/tracking/enable/${id}`)
  },
}
