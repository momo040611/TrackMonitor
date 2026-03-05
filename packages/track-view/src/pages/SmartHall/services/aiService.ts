import { api } from '../../../api/request'
import type { AiAnalysisResult, AiQueryResult } from '../types'

// 分析类型常量
export const ANALYSIS_TYPE = {
  ANOMALY_DIAGNOSIS: 'anomaly-diagnosis',
  ROOT_CAUSE_ANALYSIS: 'root-cause-analysis',
  LOG_PARSER: 'log-parser',
  DEFAULT: 'default',
} as const

// API 响应成功码
const SUCCESS_CODE = 200

// Mock 模式判断（保留供后续使用）
// const isMockMode = import.meta.env.VITE_USE_MOCK === 'true'

// 默认模拟响应
const DEFAULT_MOCK_RESPONSE: AiAnalysisResult = {
  analysis: '基于当前数据分析，发现以下问题：',
  recommendations: ['建议优化错误处理机制', '增加监控覆盖范围'],
  confidence: 0.85,
  issues: [
    {
      id: '1',
      level: 'error',
      title: 'API 响应时间过长',
      description: '部分接口响应时间超过 2s',
      suggestion: '建议优化数据库查询',
      score_impact: 15,
    },
  ],
}

/**
 * 处理 API 响应
 * @param apiResult API 响应结果
 * @returns 处理后的数据
 */
const handleApiResponse = <T>(apiResult: { data?: { code: number; data?: T } }): T | null => {
  if (apiResult?.data?.code === SUCCESS_CODE) {
    return apiResult.data.data ?? null
  }
  return null
}

/**
 * 根据分析类型获取对应的 API 方法
 * @param analysisType 分析类型
 * @returns API 方法
 */
const getApiMethodForType = (analysisType: string) => {
  switch (analysisType) {
    case ANALYSIS_TYPE.ANOMALY_DIAGNOSIS:
    case ANALYSIS_TYPE.LOG_PARSER:
      return api.analyzeErrorEvents
    case ANALYSIS_TYPE.ROOT_CAUSE_ANALYSIS:
      return api.analyzeAllEvents
    default:
      return api.analyzeAllEvents
  }
}

export const AiService = {
  /**
   * 生成埋点代码
   * @param requirement 需求描述
   * @returns 生成的代码
   */
  generateCode: async (requirement: string): Promise<string> => {
    const sanitizedRequirement = requirement.replace(/[^a-zA-Z0-9_]/g, '_')

    return `// 生成的埋点代码
tracker.log('custom', {
  eventName: '${sanitizedRequirement}',
  timestamp: Date.now(),
  userAgent: navigator.userAgent
});`
  },

  /**
   * 获取 AI 分析数据
   * @param analysisType 分析类型
   * @returns 分析结果
   */
  getAiAnalysisData: async (analysisType: string): Promise<AiAnalysisResult> => {
    try {
      const apiMethod = getApiMethodForType(analysisType)
      const apiResult = await apiMethod({ time: '24h' })
      const data = handleApiResponse<AiAnalysisResult>(apiResult)

      // 如果 API 返回数据，使用 API 数据；否则使用默认模拟数据
      return data ?? DEFAULT_MOCK_RESPONSE
    } catch {
      return {}
    }
  },

  /**
   * 发送 AI 查询
   * @param query 查询内容
   * @returns 查询结果
   */
  sendQuery: async (query: string): Promise<AiQueryResult> => {
    try {
      const apiResult = await api.sendAiQuery({ query })
      const data = handleApiResponse<AiQueryResult>(apiResult)

      return data ?? {}
    } catch {
      return {}
    }
  },
}
