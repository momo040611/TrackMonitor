export interface AIResponse<T = unknown> {
  content: string
  meta?: T
}

// 诊断项类型
export interface DiagnosisItem {
  id: string
  level: 'error' | 'warning' | 'info'
  title: string
  description: string
  suggestion: string
  affected_scope?: string
  score_impact: number
}

// 错误数据类型
export interface ErrorItem {
  message: string
  stack?: string
}

// AI 分析结果类型 - 支持多种返回格式
export type AiAnalysisResult =
  | {
      analysis?: string
      recommendations?: string[]
      confidence?: number
      issues?: DiagnosisItem[]
    }
  | {
      errors?: ErrorItem[]
    }
  | {
      insights?: string[]
    }
  | Record<string, unknown>

// AI 查询结果类型
export interface AiQueryResult {
  response?: string
  query?: string
  timestamp?: string
  parsedData?: Record<string, unknown>
}

// 诊断元数据
export interface DiagnosisMeta {
  suggestedAssignee: string // 建议分派给谁
  confidence: number // 置信度
  rootCauseType: string // 根因类型
}

// 日志分析元数据
export interface LogAnalysisMeta {
  eventType: string
  riskLevel: 'Normal' | 'Warning' | 'Critical'
}
