// 导入基础的 HTTP 请求工具
import request from '../utils/request'

// API 接口定义
export const api = {
  // 认证相关接口
  login: (data: { username: string; password: string }) => {
    return request.post('/user/login', data)
  },

  register: (data: { username: string; password: string }) => {
    return request.post('/user/register', data)
  },

  refreshToken: (data: any) => {
    return request.post('/user/refresh', data)
  },

  getUserInfo: (id: string) => {
    return request.get(`/user/${id}`)
  },

  // 性能和错误事件接口
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

  // AI 分析接口
  analyzeAllEvents: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/analyzeAll', { params })
  },

  analyzeErrorEvents: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/analyzeError', { params })
  },

  analyzeUserBehaviorEvents: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/analyzeUserBehavior', { params })
  },

  analyzePerformanceEvents: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/gateway/analyzePerformance', { params })
  },

  // 业务相关接口
  reportEventData: (data: any) => {
    return request.post('/processing/event', data)
  },

  getBusinessAnalysis: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/business/analysis', { params })
  },

  sendBusinessAlert: (data: any) => {
    return request.post('/business/alert', data)
  },

  getUserBehaviorAnalysis: (params?: { projectId: string; timeRange: string }) => {
    return request.get('/business/user-behavior', { params })
  },

  // AI 代码生成接口 (暂时保留，后续可根据后端实际接口调整)
  generateCode: (data: { requirement: string }) => {
    return request.post('/api/ai/generate-code', data)
  },

  // 数据分析相关接口 (暂时保留，后续可根据后端实际接口调整)
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

  // 埋点配置相关接口
  tracking: {
    // 获取埋点列表
    getList: () => {
      return request.get('/api/tracking/list')
    },

    // 新增埋点
    create: (data: any) => {
      return request.post('/api/tracking/create', data)
    },

    // 编辑埋点
    update: (data: any) => {
      return request.put('/api/tracking/update', data)
    },

    // 发布埋点
    publish: (data: { ids: string[] }) => {
      return request.post('/api/tracking/publish', data)
    },

    // 失效埋点
    disable: (data: { ids: string[] }) => {
      return request.post('/api/tracking/disable', data)
    },

    // 删除埋点
    delete: (data: { ids: string[] }) => {
      return request.delete('/api/tracking/delete', { data })
    },

    // 导入配置
    import: (data: any) => {
      return request.post('/api/tracking/import', data)
    },

    // 导出配置
    export: () => {
      return request.get('/api/tracking/export')
    },
  },
}
