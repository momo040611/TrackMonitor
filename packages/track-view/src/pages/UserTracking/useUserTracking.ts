import { useState, useRef, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { api } from '../../api/request'

export interface TrackingData {
  key: string
  type: string
  timestamp: number
  platform: string
  details: string
}

// 定义追踪器类型
interface Tracker {
  track: (event: string, data: Record<string, unknown>) => void
  use: (plugin: unknown) => void
}

// 定义窗口扩展类型
declare global {
  interface Window {
    wx?: {
      miniProgram?: unknown
    }
    process?: {
      type?: string
    }
  }
}

// 定义 API 返回数据项类型
interface TrackingItem {
  id?: string
  type?: string
  timestamp?: number
  platform?: string
  details?: string
}

export const useUserTracking = () => {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [activePlatform, setActivePlatform] = useState<string>('web')
  const [isTracking, setIsTracking] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const trackerRef = useRef<Tracker | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const addTrackingData = useCallback((type: string, platform: string, details: string) => {
    const newData: TrackingData = {
      key: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      timestamp: Date.now(),
      platform,
      details,
    }
    setTrackingData((prev) => [newData, ...prev].slice(0, 50))
  }, [])

  const detectPlatform = useCallback((): string => {
    if (typeof window.wx !== 'undefined' && window.wx.miniProgram) return 'mini-program'
    if (typeof window === 'undefined') return 'nodejs'
    if (typeof window.process === 'object' && window.process.type === 'renderer') return 'electron'
    return 'web'
  }, [])

  const fetchTrackingData = useCallback(async (currentPlatform: string) => {
    try {
      const result = await api.getUserBehaviorData({ projectId: 'default', timeRange: '24h' })
      if (result?.data?.code === 200 && Array.isArray(result.data.data)) {
        const formattedData = result.data.data.map((item: TrackingItem, index: number) => ({
          key: item.id || `event-${index}-${Date.now()}`,
          type: item.type || 'unknown',
          timestamp: item.timestamp || Date.now(),
          platform: item.platform || currentPlatform,
          details: item.details || JSON.stringify(item),
        }))
        setTrackingData(formattedData.slice(0, 50))
      }
    } catch {
      // 静默失败，防干扰
    }
  }, [])

  const startTracking = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!trackerRef.current) {
        trackerRef.current = { track: () => {}, use: () => {} }
      }
      setIsTracking(true)
      const platform = detectPlatform()
      setActivePlatform(platform)

      trackerRef.current.track('tracking_started', { platform, userAgent: navigator.userAgent })
      addTrackingData('tracking_started', platform, 'User started tracking')

      await fetchTrackingData(platform)

      pollingIntervalRef.current = setInterval(() => {
        fetchTrackingData(platform)
      }, 5000)
    } catch {
      message.error('开始追踪失败')
      setIsTracking(false)
    } finally {
      setIsLoading(false)
    }
  }, [detectPlatform, fetchTrackingData, addTrackingData])

  const stopTracking = useCallback(() => {
    if (trackerRef.current) {
      trackerRef.current.track('tracking_stopped', { platform: activePlatform })
      addTrackingData('tracking_stopped', activePlatform, 'User stopped tracking')
    }
    setIsTracking(false)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [activePlatform, addTrackingData])

  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [stopTracking])

  return {
    trackingData,
    setTrackingData,
    activePlatform,
    setActivePlatform,
    isTracking,
    isLoading,
    trackerRef,
    startTracking,
    stopTracking,
    addTrackingData,
  }
}
