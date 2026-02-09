import type { MockMethod } from 'vite-plugin-mock'

console.log('Mock module loaded')
// 只在 Node.js 环境中打印当前工作目录
if (typeof process !== 'undefined') {
  console.log('Current working directory:', process.cwd())
}

// 模拟用户数据
const mockUsers = [
  { id: '1', username: 'admin', password: '123456', token: 'mock-token-admin' },
  { id: '2', username: 'test', password: '123456', token: 'mock-token-test' },
]

// 登录接口
const loginMock: MockMethod = {
  url: '/api/login',
  method: 'post',
  response: (options: any) => {
    const { username, password } = options.body
    const user = mockUsers.find((u) => u.username === username && u.password === password)

    if (user) {
      return { code: 200, user }
    } else {
      return { code: 401, message: '用户名或密码错误' }
    }
  },
}

// 注册接口
const registerMock: MockMethod = {
  url: '/api/register',
  method: 'post',
  response: (options: any) => {
    const { username, password } = options.body
    const existingUser = mockUsers.find((u) => u.username === username)

    if (existingUser) {
      return { code: 400, message: '用户名已存在' }
    } else {
      const newUser = {
        id: Date.now().toString(36),
        username,
        password,
        token: `mock-token-${Date.now()}`,
      }
      mockUsers.push(newUser)
      return { code: 200, user: newUser }
    }
  },
}

// 获取当前用户信息接口
const meMock: MockMethod = {
  url: '/api/me',
  method: 'get',
  response: (options: any) => {
    const authHeader = options.headers.authorization
    if (!authHeader) {
      return { code: 401, message: '请重新登录' }
    }

    const token = authHeader.split(' ')[1]
    const user = mockUsers.find((u) => u.token === token)

    if (user) {
      return { code: 200, user }
    } else {
      return { code: 401, message: '请重新登录' }
    }
  },
}

// 检查用户名是否已存在接口
const checkUsernameMock: MockMethod = {
  url: '/api/check-username',
  method: 'post',
  response: (options: any) => {
    const { username } = options.body
    const existingUser = mockUsers.find((u) => u.username === username)

    if (existingUser) {
      return { code: 400, message: '用户名已存在' }
    } else {
      return { code: 200, message: '用户名可用' }
    }
  },
}

// 模拟数据仪表板数据
const mockOverviewData = {
  totalPV: 123456,
  totalUV: 78901,
  todayTracking: 5678,
  yoyGrowth: 12.5,
  momGrowth: 8.3,
}

// 生成趋势数据
const generateTrendData = () => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 29 + i)
    return {
      date: date.toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 1000) + 500,
      impressions: Math.floor(Math.random() * 2000) + 1000,
    }
  })
}

// 模拟类型分布数据
const mockTypeDistributionData = [
  { type: '点击', value: 4500, percentage: 45, color: '#1890ff' },
  { type: '曝光', value: 3000, percentage: 30, color: '#52c41a' },
  { type: '激活', value: 1500, percentage: 15, color: '#faad14' },
  { type: '转化', value: 1000, percentage: 10, color: '#f5222d' },
]

// 生成热门埋点数据
const generateTopTrackingData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    key: i,
    name: `埋点${i + 1}`,
    clicks: Math.floor(Math.random() * 1000) + 100,
    status: i % 2 === 0 ? 'normal' : 'warning',
  })).sort((a, b) => b.clicks - a.clicks)
}

// 模拟转化漏斗数据
const mockFunnelData = [
  { name: '曝光', value: 10000, percentage: 100, color: '#1890ff' },
  { name: '点击', value: 6000, percentage: 60, color: '#52c41a' },
  { name: '激活', value: 3000, percentage: 30, color: '#faad14' },
  { name: '转化', value: 1500, percentage: 15, color: '#f5222d' },
]

// 生成实时数据
const generateRealtimeData = () => {
  return {
    current: Math.floor(Math.random() * 1000) + 500,
    trend: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 50),
  }
}

// 模拟埋点配置数据
const mockTrackingData = [
  {
    key: '1',
    id: '#1001',
    name: '首页 Banner 点击',
    type: '点击',
    page: '/home',
    trigger: '元素点击',
    status: 'active',
    statusText: '已生效',
    statusIcon: '✅',
  },
  {
    key: '2',
    id: '#1002',
    name: '商品详情页曝光',
    type: '曝光',
    page: '/product',
    trigger: '页面加载',
    status: 'pending',
    statusText: '待发布',
    statusIcon: '⚠️',
  },
  {
    key: '3',
    id: '#1003',
    name: '支付按钮点击',
    type: '点击',
    page: '/pay',
    trigger: '元素点击',
    status: 'inactive',
    statusText: '已失效',
    statusIcon: '❌',
  },
]

// 概览数据接口
const overviewMock: MockMethod = {
  url: '/api/analytics/overview',
  method: 'get',
  response: () => {
    return { code: 200, data: mockOverviewData }
  },
}

// 趋势数据接口
const trendMock: MockMethod = {
  url: '/api/analytics/trend',
  method: 'get',
  response: () => {
    return { code: 200, data: generateTrendData() }
  },
}

// 类型分布数据接口
const typeDistributionMock: MockMethod = {
  url: '/api/analytics/type-distribution',
  method: 'get',
  response: () => {
    return { code: 200, data: mockTypeDistributionData }
  },
}

// 热门埋点数据接口
const topTrackingMock: MockMethod = {
  url: '/api/analytics/top-tracking',
  method: 'get',
  response: () => {
    return { code: 200, data: generateTopTrackingData() }
  },
}

// 转化漏斗数据接口
const funnelMock: MockMethod = {
  url: '/api/analytics/funnel',
  method: 'get',
  response: () => {
    return { code: 200, data: mockFunnelData }
  },
}

// 实时数据接口
const realtimeMock: MockMethod = {
  url: '/api/analytics/realtime',
  method: 'get',
  response: () => {
    return { code: 200, data: generateRealtimeData() }
  },
}

// 埋点配置列表接口
const trackingListMock: MockMethod = {
  url: '/api/tracking/list',
  method: 'get',
  response: () => {
    return { code: 200, data: mockTrackingData }
  },
}

// 数据分析示例数据接口
const sampleDataMock: MockMethod = {
  url: '/api/analysis/sample-data',
  method: 'get',
  response: () => {
    return {
      code: 200,
      data: [
        { id: '1', userId: 'u1', event: 'click', value: 10, timestamp: '2025-01-01T10:00:00Z' },
        { id: '1', userId: 'u1', event: 'click', value: 10, timestamp: '2025-01-01T10:00:00Z' },
        { id: '2', userId: 'u2', event: 'view', value: null, timestamp: 'invalid' },
        { id: '3', userId: 'u3', event: 'click', value: 5, timestamp: '2025-01-01T11:00:00Z' },
      ],
    }
  },
}

// 数据分析元数据接口
const metadataMock: MockMethod = {
  url: '/api/analysis/metadata',
  method: 'get',
  response: () => {
    return {
      code: 200,
      data: {
        dictionary: [
          { field: 'id', type: 'string', required: true, description: '事件ID' },
          { field: 'userId', type: 'string', required: true, description: '用户ID' },
          { field: 'event', type: 'string', required: true, description: '事件类型' },
          { field: 'value', type: 'number', required: false, description: '事件值' },
          { field: 'timestamp', type: 'string', required: true, description: '时间戳' },
        ],
        tags: [
          { name: '点击', category: 'user', color: 'blue' },
          { name: '浏览', category: 'user', color: 'green' },
          { name: '错误', category: 'system', color: 'red' },
          { name: '性能', category: 'system', color: 'orange' },
        ],
        configs: [
          { key: 'pageSize', value: '10', description: '分页大小' },
          { key: 'timeRange', value: '7d', description: '默认时间范围' },
        ],
      },
    }
  },
}

// AI 代码生成接口
const aiGenerateCodeMock: MockMethod = {
  url: '/api/ai/generate-code',
  method: 'post',
  response: (req: any) => {
    const { requirement } = req.body
    return {
      code: 200,
      data: `// AI 为需求 "${requirement}" 生成的代码\ntracker.log('click', { action: 'signup' });`,
    }
  },
}

// AI 分析数据接口
const aiAnalysisMock: MockMethod = {
  url: '/api/ai/analysis',
  method: 'get',
  response: (req: any) => {
    const { analysisType } = req.query

    // 根据分析类型返回不同的模拟数据
    if (analysisType === 'anomaly') {
      return {
        code: 200,
        data: {
          anomalies: [
            {
              id: '1',
              type: '数据量异常',
              time: '2024-01-15 10:30:00',
              severity: 'high',
              description: '埋点数据量突然下降 50%',
            },
            {
              id: '2',
              type: '响应时间异常',
              time: '2024-01-14 14:20:00',
              severity: 'medium',
              description: '埋点响应时间超过阈值',
            },
          ],
        },
      }
    } else if (analysisType === 'recommendation') {
      return {
        code: 200,
        data: {
          recommendations: [
            {
              id: '1',
              type: '性能优化',
              priority: 'high',
              content: '优化埋点上报频率，减少网络请求',
              expectedEffect: '减少 30% 的网络流量',
            },
            {
              id: '2',
              type: '数据质量',
              priority: 'medium',
              content: '增加数据验证规则，提高数据准确性',
              expectedEffect: '提高数据准确率 20%',
            },
          ],
        },
      }
    } else {
      return {
        code: 200,
        data: {
          trends: [
            { date: '2024-01-10', value: 1000 },
            { date: '2024-01-11', value: 1200 },
            { date: '2024-01-12', value: 1100 },
            { date: '2024-01-13', value: 1300 },
            { date: '2024-01-14', value: 1500 },
          ],
        },
      }
    }
  },
}

// AI 分析查询接口
const aiSendQueryMock: MockMethod = {
  url: '/api/ai/send-query',
  method: 'post',
  response: (req: any) => {
    const { query } = req.body
    return {
      code: 200,
      data: {
        response: `AI 已分析您的查询："${query}"。根据模拟数据，最近 7 天的埋点数据趋势整体呈现上升趋势，日均增长率约为 10%。未检测到明显异常情况。建议继续保持当前的埋点策略，并考虑增加性能监控指标。`,
      },
    }
  },
}

// 导出模拟接口
const mockModules = [
  loginMock,
  registerMock,
  meMock,
  checkUsernameMock,
  overviewMock,
  trendMock,
  typeDistributionMock,
  topTrackingMock,
  funnelMock,
  realtimeMock,
  trackingListMock,
  sampleDataMock,
  metadataMock,
  aiGenerateCodeMock,
  aiAnalysisMock,
  aiSendQueryMock,
]

// 导出生产环境使用的函数
export const setupProdMockServer = () => {
  // 生产环境中我们不使用模拟接口
}

// 导出模拟模块
export default mockModules
