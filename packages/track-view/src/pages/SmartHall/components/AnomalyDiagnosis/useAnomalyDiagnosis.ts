import { useState, useEffect, useRef, useCallback } from 'react'
import { message } from 'antd'
import { AiService } from '../../services/useAiAssistant'

export interface DiagnosisItem {
  id: string
  level: 'error' | 'warning' | 'info'
  title: string
  description: string
  suggestion: string
  affected_scope?: string
  score_impact: number
}

const DEFAULT_ISSUES: DiagnosisItem[] = [
  {
    id: '1',
    level: 'error',
    title: 'generate_click 事件参数缺失',
    description: '检测到 5% 的生成点击事件缺失 model_type 参数。',
    suggestion: '请检查 TrackSDK 的调用代码，确保 payload 中包含 model_type 字段。',
    affected_scope: 'A/B 测试实验组 B',
    score_impact: 15,
  },
  {
    id: '2',
    level: 'warning',
    title: 'work_show 曝光未去重',
    description: '同一作品 ID 在短时间内触发了多次曝光。',
    suggestion: '建议引入防抖 (Debounce) 机制，或使用 SDK 的 once: true 选项。',
    score_impact: 5,
  },
  {
    id: '3',
    level: 'info',
    title: 'Prompt 长度分布异常',
    description: '检测到超长 Prompt (Length > 1000) 占比上升。',
    suggestion: '业务提示，暂无需代码修复。',
    score_impact: 0,
  },
]

export const useAnomalyDiagnosis = () => {
  const [analyzing, setAnalyzing] = useState(false)
  const [healthScore, setHealthScore] = useState(100)
  const [issues, setIssues] = useState<DiagnosisItem[]>([])

  // 抽屉与当前选中项状态
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentIssue, setCurrentIssue] = useState<DiagnosisItem | null>(null)

  const isDiagnosingRef = useRef(false)

  // 精简并合并请求逻辑
  const startDiagnosis = useCallback(async () => {
    if (isDiagnosingRef.current) return

    try {
      isDiagnosingRef.current = true
      setAnalyzing(true)
      setIssues([])

      const diagnosisData = await AiService.getAiAnalysisData('anomaly-diagnosis')

      const finalIssues = diagnosisData?.issues || DEFAULT_ISSUES

      setIssues(finalIssues)
      const totalDeduction = finalIssues.reduce(
        (acc: number, item: DiagnosisItem) => acc + item.score_impact,
        0
      )
      setHealthScore(Math.max(0, 100 - totalDeduction))

      message.success(`诊断完成 ${!diagnosisData?.issues ? '(使用默认数据)' : ''}`)
    } catch (error) {
      // 捕获异常时，直接复用常量，不再复制粘贴
      setIssues(DEFAULT_ISSUES)
      const totalDeduction = DEFAULT_ISSUES.reduce(
        (acc: number, item: DiagnosisItem) => acc + item.score_impact,
        0
      )
      setHealthScore(Math.max(0, 100 - totalDeduction))
    } finally {
      setAnalyzing(false)
      isDiagnosingRef.current = false
    }
  }, [])

  useEffect(() => {
    startDiagnosis()
  }, [startDiagnosis])

  const showDetails = useCallback((item: DiagnosisItem) => {
    setCurrentIssue(item)
    setDrawerVisible(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false)
    setCurrentIssue(null)
  }, [])

  return {
    analyzing,
    healthScore,
    issues,
    drawerVisible,
    currentIssue,
    startDiagnosis,
    showDetails,
    closeDrawer,
  }
}
