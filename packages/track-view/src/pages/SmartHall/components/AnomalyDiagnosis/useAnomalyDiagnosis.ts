import { useState, useEffect, useRef, useCallback } from 'react'
import { message } from 'antd'
import { AiService } from '../../services/aiService'
import { DEFAULT_ISSUES } from '../../mocks/anomalyDiagnosis'
import type { DiagnosisItem, AiAnalysisResult } from '../../types'

export const useAnomalyDiagnosis = () => {
  const [analyzing, setAnalyzing] = useState(false)
  const [healthScore, setHealthScore] = useState(100)
  const [issues, setIssues] = useState<DiagnosisItem[]>([])

  // 抽屉与当前选中项状态
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentIssue, setCurrentIssue] = useState<DiagnosisItem | null>(null)

  // 使用 ref 跟踪请求状态，避免重复请求
  const isDiagnosingRef = useRef(false)
  const hasFetchedRef = useRef(false)
  const isMountedRef = useRef(true)

  // 计算健康分数
  const calculateHealthScore = useCallback((items: DiagnosisItem[]) => {
    const totalDeduction = items.reduce(
      (acc: number, item: DiagnosisItem) => acc + item.score_impact,
      0
    )
    return Math.max(0, 100 - totalDeduction)
  }, [])

  // 精简并合并请求逻辑
  const startDiagnosis = useCallback(
    async (force: boolean = false) => {
      // 防止重复请求（除非是强制重新诊断）
      if (isDiagnosingRef.current || (!force && hasFetchedRef.current)) {
        return
      }

      try {
        isDiagnosingRef.current = true
        setAnalyzing(true)
        setIssues([])

        const diagnosisData: AiAnalysisResult =
          await AiService.getAiAnalysisData('anomaly-diagnosis')

        // 组件已卸载则不更新状态
        if (!isMountedRef.current) return

        // 检查 diagnosisData 是否有 issues 属性（类型守卫）
        const hasIssues =
          diagnosisData && 'issues' in diagnosisData && Array.isArray(diagnosisData.issues)
        const finalIssues = hasIssues ? (diagnosisData.issues as DiagnosisItem[]) : DEFAULT_ISSUES

        setIssues(finalIssues)
        setHealthScore(calculateHealthScore(finalIssues))

        message.success(`诊断完成 ${!hasIssues ? '(使用默认数据)' : ''}`)
      } catch {
        // 组件已卸载则不更新状态
        if (!isMountedRef.current) return

        // 捕获异常时，使用默认数据
        setIssues(DEFAULT_ISSUES)
        setHealthScore(calculateHealthScore(DEFAULT_ISSUES))
      } finally {
        if (isMountedRef.current) {
          setAnalyzing(false)
        }
        isDiagnosingRef.current = false
        hasFetchedRef.current = true
      }
    },
    [calculateHealthScore]
  )

  useEffect(() => {
    // 标记组件已挂载
    isMountedRef.current = true

    // 只在组件挂载时执行一次诊断
    if (!hasFetchedRef.current) {
      // 使用 ref 避免依赖警告，startDiagnosis 内部使用 ref 管理状态
      startDiagnosis()
    }

    // 清理函数：标记组件已卸载
    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在挂载时执行，startDiagnosis 使用 ref 管理状态

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
