// 风险评分阈值
export const RISK_THRESHOLD = {
  HIGH: 80,
  MEDIUM: 60,
} as const

// 颜色配置
export const COLORS = {
  HIGH_RISK: '#ff4d4f',
  MEDIUM_RISK: '#faad14',
  LOW_RISK: '#1890ff',
  HIGH_RISK_BG: '#fff1f0',
  MEDIUM_RISK_BG: '#fff7e6',
  LOW_RISK_BG: '#e6f7ff',
} as const

// 模拟数据
export const MOCK_LOGS_COUNT = 5
export const ANALYZE_DELAY_MS = 1500
export const PATH_CALCULATION_DELAY_MS = 100

// 节点类型映射
export const NODE_TYPE_MAP = {
  infrastructure: '基础设施',
  business: '业务',
  client: '客户端',
} as const
