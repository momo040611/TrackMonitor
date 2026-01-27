// 模拟数据

// 用户数据
export const userData = {
  username: 'admin',
  password: '123456',
  token: 'mock-token',
}

// 基础数据概览
export const overviewData = {
  activeUsers: 1234,
  totalEvents: 56789,
  successRate: 99.9,
  errorRate: 0.1,
}

// 用户行为路径
export const userPathData = [
  {
    id: 1,
    action: '应用启动',
    time: '2026-01-27 10:00:00',
  },
  {
    id: 2,
    action: '进入首页',
    time: '2026-01-27 10:00:05',
  },
  {
    id: 3,
    action: '点击按钮',
    time: '2026-01-27 10:00:10',
  },
  {
    id: 4,
    action: '离开页面',
    time: '2026-01-27 10:00:15',
  },
]

// 用户画像
export const userProfileData = {
  deviceType: '移动设备',
  os: 'iOS 17.0',
  browser: 'Safari 17.0',
  region: '中国',
}

// 智能大厅功能模块
export const smartHallModules = [
  {
    id: 1,
    title: '数据可视化大屏',
    description: '实时监控SDK使用情况',
    icon: '📊',
    color: '#1890ff',
    bgColor: '#f0f9ff',
    borderColor: '#e6f7ff',
  },
  {
    id: 2,
    title: '告警中心',
    description: '及时发现并处理异常',
    icon: '🚨',
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#d9f7be',
  },
  {
    id: 3,
    title: '性能分析',
    description: '深度分析SDK性能问题',
    icon: '📈',
    color: '#fa8c16',
    bgColor: '#fff7e6',
    borderColor: '#ffe7ba',
  },
  {
    id: 4,
    title: '用户行为追踪',
    description: '精准定位用户行为路径',
    icon: '🔍',
    color: '#f5222d',
    bgColor: '#fff0f0',
    borderColor: '#ffccc7',
  },
]

// 数据分析图表数据
export const analysisData = {
  trend: [
    { date: '2026-01-21', value: 800 },
    { date: '2026-01-22', value: 1200 },
    { date: '2026-01-23', value: 1000 },
    { date: '2026-01-24', value: 1500 },
    { date: '2026-01-25', value: 1300 },
    { date: '2026-01-26', value: 1800 },
    { date: '2026-01-27', value: 1234 },
  ],
  performance: [
    { name: '启动时间', value: 150 },
    { name: '响应时间', value: 80 },
    { name: '上报时间', value: 50 },
    { name: '处理时间', value: 30 },
  ],
  errorRate: [
    { date: '2026-01-21', value: 0.2 },
    { date: '2026-01-22', value: 0.15 },
    { date: '2026-01-23', value: 0.1 },
    { date: '2026-01-24', value: 0.08 },
    { date: '2026-01-25', value: 0.12 },
    { date: '2026-01-26', value: 0.09 },
    { date: '2026-01-27', value: 0.1 },
  ],
}

// SDK设置选项
export const sdkSettings = {
  sampleRate: 100,
  reportInterval: 10000,
  debugMode: false,
}
