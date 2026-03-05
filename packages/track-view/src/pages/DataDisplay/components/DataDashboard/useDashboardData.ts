import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '../../../../api/request'
import { message } from 'antd'

// 判断是否处于 Mock 模式
const isMockMode = import.meta.env.VITE_USE_MOCK === 'true'

export interface OverviewData {
  totalPV: number
  totalUV: number
  todayTracking: number
  yoyGrowth: number
  momGrowth: number
}

export interface TrendDataItem {
  date: string
  clicks: number
  impressions: number
}

export interface TypeDistributionItem {
  type: string
  value: number
  percentage: number
  color: string
}

export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalPV: 0,
    totalUV: 0,
    todayTracking: 0,
    yoyGrowth: 0,
    momGrowth: 0,
  })
  const [trendData, setTrendData] = useState<TrendDataItem[]>([])
  const [typeDistributionData, setTypeDistributionData] = useState<TypeDistributionItem[]>([])
  const [realtimeData, setRealtimeData] = useState<number>(0)
  const [realtimeChartData, setRealtimeChartData] = useState<number[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  //  获取大盘初始数据
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiParams = { projectId: 'default', timeRange: '24h' }

      // 获取错误数据
      let errorCount = 0
      try {
        const errorResult = await api.getErrorData(apiParams)
        if (errorResult && typeof errorResult === 'object' && 'data' in errorResult) {
          const data = (errorResult as { data?: unknown }).data
          if (Array.isArray(data)) errorCount = data.length
          else if (typeof data === 'number') errorCount = data
        }
      } catch (err) {
        // 只有在 Mock 模式下才使用默认值，否则抛出错误
        if (!isMockMode) throw err
        errorCount = 0
      }

      // 获取性能数据
      let successRate = 0
      try {
        const performanceResult = await api.getPerformanceData(apiParams)
        if (
          performanceResult &&
          typeof performanceResult === 'object' &&
          'data' in performanceResult
        ) {
          const perfData = (
            performanceResult as { data?: { successCount?: number; totalCount?: number } }
          ).data
          if (perfData && typeof perfData === 'object') {
            const { successCount = 0, totalCount = 1 } = perfData
            if (totalCount > 0) successRate = Math.round((successCount / totalCount) * 100)
          }
        }
      } catch (err) {
        // 只有在 Mock 模式下才使用默认值，否则抛出错误
        if (!isMockMode) throw err
        successRate = 0
      }

      // 获取所有事件数据
      let todayEvents = 0
      try {
        const allEventsResult = await api.getAllEvents(apiParams)
        if (allEventsResult && typeof allEventsResult === 'object' && 'data' in allEventsResult) {
          const data = (allEventsResult as { data?: unknown }).data
          if (Array.isArray(data)) todayEvents = data.length
          else if (typeof data === 'number') todayEvents = data
        }
      } catch (err) {
        // 只有在 Mock 模式下才使用默认值，否则抛出错误
        if (!isMockMode) throw err
        todayEvents = 0
      }

      setOverviewData({
        totalPV: errorCount,
        totalUV: successRate,
        todayTracking: todayEvents,
        yoyGrowth: Math.floor(Math.random() * 20) - 5,
        momGrowth: Math.floor(Math.random() * 15) - 3,
      })

      setTrendData(
        Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}日`,
          clicks: Math.floor(Math.random() * 100) + 50,
          impressions: Math.floor(Math.random() * 1000) + 500,
        }))
      )

      setTypeDistributionData([
        { type: '错误', value: 25, percentage: 25, color: '#f5222d' },
        { type: '性能', value: 20, percentage: 20, color: '#1890ff' },
        { type: '点击', value: 35, percentage: 35, color: '#52c41a' },
        { type: '其他', value: 20, percentage: 20, color: '#faad14' },
      ])
    } catch (error) {
      console.error('获取大盘数据失败:', error)
      message.error('获取数据失败，请稍后重试')

      // 只有在 Mock 模式下才使用兜底数据
      if (isMockMode) {
        setOverviewData({ totalPV: 0, totalUV: 0, todayTracking: 0, yoyGrowth: 0, momGrowth: 0 })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 实时数据轮询逻辑
  const startRealtimePolling = useCallback(() => {
    const updateRealtimeData = async () => {
      try {
        await api.getAllEvents({ projectId: 'default', timeRange: '24h' })
        setRealtimeData(Math.floor(Math.random() * 50))
        setRealtimeChartData(Array.from({ length: 10 }, () => Math.floor(Math.random() * 20)))
      } catch (error) {
        // 只有在 Mock 模式下才静默处理错误
        if (!isMockMode) {
          console.error('实时数据获取失败:', error)
        }
      }
    }

    updateRealtimeData()
    intervalRef.current = setInterval(updateRealtimeData, 10000)
  }, [])

  // 统一生命周期管理
  useEffect(() => {
    fetchInitialData()
    startRealtimePolling()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchInitialData, startRealtimePolling])

  return {
    isLoading,
    overviewData,
    trendData,
    typeDistributionData,
    realtimeData,
    realtimeChartData,
  }
}
