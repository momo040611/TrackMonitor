export interface AIResponse<T = any> {
  content: string
  meta?: T
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
