import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../../api/request'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  description: string
}
export interface ApiRequestMetric {
  url: string
  method: string
  duration: number
  status: number
  timestamp: string
}
export interface ResourceMetric {
  name: string
  type: string
  duration: number
  size: number
  timestamp: string
}
export interface LongTaskMetric {
  duration: number
  startTime: number
  timestamp: string
}
export interface PerformanceData {
  coreMetrics: PerformanceMetric[]
  apiRequests: ApiRequestMetric[]
  resources: ResourceMetric[]
  longTasks: LongTaskMetric[]
}

const DEFAULT_DATA: PerformanceData = {
  coreMetrics: [
    { name: 'FCP', value: 1200, unit: 'ms', description: '首次内容绘制' },
    { name: 'LCP', value: 2500, unit: 'ms', description: '最大内容绘制' },
    { name: 'CLS', value: 0.1, unit: '', description: '累积布局偏移' },
    { name: 'TTI', value: 3000, unit: 'ms', description: '可交互时间' },
  ],
  apiRequests: [
    {
      url: '/api/login',
      method: 'POST',
      duration: 120,
      status: 200,
      timestamp: new Date().toISOString(),
    },
    {
      url: '/api/getData',
      method: 'GET',
      duration: 80,
      status: 200,
      timestamp: new Date().toISOString(),
    },
    {
      url: '/api/update',
      method: 'PUT',
      duration: 150,
      status: 200,
      timestamp: new Date().toISOString(),
    },
    {
      url: '/api/delete',
      method: 'DELETE',
      duration: 60,
      status: 200,
      timestamp: new Date().toISOString(),
    },
    {
      url: '/api/query',
      method: 'GET',
      duration: 100,
      status: 200,
      timestamp: new Date().toISOString(),
    },
  ],
  resources: [
    {
      name: 'app.js',
      type: 'script',
      duration: 300,
      size: 102400,
      timestamp: new Date().toISOString(),
    },
    {
      name: 'styles.css',
      type: 'style',
      duration: 150,
      size: 20480,
      timestamp: new Date().toISOString(),
    },
    {
      name: 'logo.png',
      type: 'image',
      duration: 200,
      size: 51200,
      timestamp: new Date().toISOString(),
    },
    {
      name: 'icon.svg',
      type: 'image',
      duration: 100,
      size: 10240,
      timestamp: new Date().toISOString(),
    },
    {
      name: 'font.ttf',
      type: 'font',
      duration: 250,
      size: 81920,
      timestamp: new Date().toISOString(),
    },
  ],
  longTasks: [
    { duration: 100, startTime: 1000, timestamp: new Date().toISOString() },
    { duration: 150, startTime: 2000, timestamp: new Date().toISOString() },
    { duration: 80, startTime: 3000, timestamp: new Date().toISOString() },
    { duration: 120, startTime: 4000, timestamp: new Date().toISOString() },
  ],
}

export const usePerformanceData = () => {
  const [timeRange, setTimeRange] = useState<string>('7days')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [performanceData, setPerformanceData] = useState<PerformanceData>(DEFAULT_DATA)

  const fetchPerformanceData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getPerformanceData()
      if (result && typeof result === 'object') {
        let data: any = result
        if ('data' in result) data = result.data
        else if (
          'status' in (result as any) &&
          (result as any).status === 0 &&
          'data' in (result as any)
        ) {
          data = (result as any).data
        }

        setPerformanceData({
          coreMetrics: Array.isArray(data?.coreMetrics)
            ? data.coreMetrics
            : DEFAULT_DATA.coreMetrics,
          apiRequests:
            Array.isArray(data?.apiRequests) && data.apiRequests.length > 0
              ? data.apiRequests
              : DEFAULT_DATA.apiRequests,
          resources:
            Array.isArray(data?.resources) && data.resources.length > 0
              ? data.resources
              : DEFAULT_DATA.resources,
          longTasks:
            Array.isArray(data?.longTasks) && data.longTasks.length > 0
              ? data.longTasks
              : DEFAULT_DATA.longTasks,
        })
      } else {
        setPerformanceData(DEFAULT_DATA)
      }
    } catch (error) {
      setPerformanceData(DEFAULT_DATA)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchPerformanceData()
  }, [fetchPerformanceData])

  return {
    timeRange,
    setTimeRange,
    isLoading,
    performanceData,
  }
}
