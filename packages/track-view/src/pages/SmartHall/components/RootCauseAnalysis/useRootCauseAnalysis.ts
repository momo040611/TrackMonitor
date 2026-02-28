import { useState, useCallback } from 'react'
import { message } from 'antd'

export interface RootCauseResult {
  dimension: string
  value: string
  score: number
  description: string
  type?: 'infrastructure' | 'business' | 'client'
}

export interface DetailLog {
  id: string
  time: string
  level: 'ERROR' | 'WARN'
  message: string
  stack?: string
}

export const useRootCauseAnalysis = (onAnalyzeLog?: (log: string) => void) => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RootCauseResult[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedNode, setSelectedNode] = useState<RootCauseResult | null>(null)
  const [detailLogs, setDetailLogs] = useState<DetailLog[]>([])

  // 模拟归因分析请求
  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockResponse: RootCauseResult[] = [
      {
        dimension: 'app_version',
        value: '2.4.0-beta',
        score: 95,
        type: 'client',
        description: '崩溃率激增，高度聚集于该内测版本',
      },
      {
        dimension: 'db_instance',
        value: 'rm-bp1x9... (主库)',
        score: 88,
        type: 'infrastructure',
        description: 'CPU 使用率持续 99%，导致写入超时',
      },
      {
        dimension: 'api_path',
        value: '/api/v1/user/profile',
        score: 72,
        type: 'business',
        description: '接口 P99 延迟超过 2s',
      },
      {
        dimension: 'api_path',
        value: '/api/v1/order/create',
        score: 68,
        type: 'business',
        description: '下单接口偶发 502 错误',
      },
      {
        dimension: 'region',
        value: '华东-上海',
        score: 45,
        type: 'infrastructure',
        description: '该区域网络抖动（置信度低）',
      },
      {
        dimension: 'os',
        value: 'Android 14',
        score: 42,
        type: 'client',
        description: '特定系统版本兼容性问题',
      },
    ]
    setResults(mockResponse.sort((a, b) => b.score - a.score))
    setLoading(false)
  }, [])

  // 节点点击交互
  const handleItemClick = useCallback((item: RootCauseResult) => {
    setSelectedNode(item)
    const mockLogs: DetailLog[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `err-${i}`,
      time: `2026-02-04 14:${30 + i}:${15 + i}`,
      level: 'ERROR',
      message:
        item.type === 'client'
          ? `Uncaught Exception in ${item.value}: NullPointerException`
          : `TimeoutException: Connection to ${item.value} timed out`,
      stack: `at com.example.service.OrderService.create(OrderService.java:42)\n   at com.example.controller.OrderController.submit(OrderController.java:108)`,
    }))
    setDetailLogs(mockLogs)
    setDrawerVisible(true)
  }, [])

  // 深度分析交互
  const handleDeepAnalysis = useCallback(
    (log: DetailLog) => {
      if (!onAnalyzeLog) return
      const rawLogString = `[${log.time}] [${log.level}] [Thread-main] ${log.message}\n${log.stack || ''}`
      onAnalyzeLog(rawLogString)
      message.loading('正在提取日志上下文...', 0.5)
    },
    [onAnalyzeLog]
  )

  return {
    loading,
    results,
    drawerVisible,
    setDrawerVisible,
    selectedNode,
    detailLogs,
    handleAnalyze,
    handleItemClick,
    handleDeepAnalysis,
  }
}
