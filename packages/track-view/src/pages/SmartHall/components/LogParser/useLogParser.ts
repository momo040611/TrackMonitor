import { useState, useEffect, useCallback, useRef } from 'react'
import { message } from 'antd'
import { AiService } from '../../services/aiService'
import { useSmartHall } from '../../hooks/useSmartHall'
import type { AiQueryResult } from '../../types'

export interface LogParseResult {
  event: string
  risk_level: string // 'high' | 'medium' | 'low'
  confidence: number
  ai_summary: string
  timestamp: string
  user: {
    id: string
    device_os: string
  }
  metrics: {
    latency: string
    status: string
  }
  properties: {
    [key: string]: string | number | boolean | undefined // 动态属性
  }
}

/**
 * 类型守卫函数：验证数据是否为有效的 LogParseResult
 * @param data 待验证的数据
 * @returns 是否为有效的 LogParseResult
 */
function isValidLogParseResult(data: unknown): data is LogParseResult {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const result = data as Record<string, unknown>

  // 验证必需字段
  const hasRequiredFields =
    typeof result.event === 'string' &&
    typeof result.risk_level === 'string' &&
    typeof result.confidence === 'number' &&
    typeof result.ai_summary === 'string' &&
    typeof result.timestamp === 'string'

  if (!hasRequiredFields) {
    return false
  }

  // 验证 user 对象
  const user = result.user as Record<string, unknown> | undefined
  const hasValidUser =
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.device_os === 'string'

  if (!hasValidUser) {
    return false
  }

  // 验证 metrics 对象
  const metrics = result.metrics as Record<string, unknown> | undefined
  const hasValidMetrics =
    typeof metrics === 'object' &&
    metrics !== null &&
    typeof metrics.latency === 'string' &&
    typeof metrics.status === 'string'

  if (!hasValidMetrics) {
    return false
  }

  // 验证 properties 对象（可选）
  const properties = result.properties
  if (properties !== undefined && (typeof properties !== 'object' || properties === null)) {
    return false
  }

  return true
}

const MOCK_LOG = `[2026-01-31 10:23:45] [INFO] [UserTrace] uid:88231 action:video_play_start video_id:v9921 source:feed_recommend device:ios_17 duration:0ms`

const MOCK_RESULT: LogParseResult = {
  event: 'video_play_start',
  risk_level: 'high',
  user: {
    id: '88231',
    device_os: 'iOS 17',
  },
  properties: {
    video_id: 'v9921',
    source_page: 'feed_recommend',
    status: 'started',
  },
  metrics: {
    latency: '450ms',
    status: '502 Bad Gateway',
  },
  timestamp: '2026-01-31 10:23:45',
  confidence: 0.98,
  ai_summary: '检测到用户在 iOS 17 环境下启动视频播放失败，且伴随高延迟与 502 网关错误。',
}

// 步骤更新延迟时间（毫秒）
const STEP_DELAYS = [800, 2000, 3000] as const

export const useLogParser = () => {
  const { logContext, goToDispatch } = useSmartHall()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [parseResult, setParseResult] = useState<LogParseResult | null>(null)
  const [inputText, setInputText] = useState(MOCK_LOG)

  // 使用 ref 跟踪组件挂载状态和定时器
  const isMountedRef = useRef(true)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  // 清理所有定时器
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  // 监听 Context 中的 logContext 变化
  useEffect(() => {
    if (logContext) {
      setInputText(logContext)
      message.info('已加载关联的根因日志')
    }
  }, [logContext])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  const handleParse = useCallback(async () => {
    // 清理之前的定时器
    clearAllTimeouts()

    setLoading(true)
    setParseResult(null)
    setCurrentStep(0)

    // 模拟处理流程的步骤更新
    STEP_DELAYS.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          setCurrentStep(index + 1)
        }
      }, delay)
      timeoutRefs.current.push(timeout)
    })

    try {
      // 调用后端接口获取日志解析数据
      const result: AiQueryResult = await AiService.sendQuery(`解析以下日志：${inputText}`)

      // 组件已卸载则不更新状态
      if (!isMountedRef.current) return

      // 处理返回的数据
      if (result && result.parsedData && isValidLogParseResult(result.parsedData)) {
        setParseResult(result.parsedData)
        message.success('日志解析完成')
      } else {
        // 如果没有数据或数据格式不正确，使用默认数据
        setParseResult(MOCK_RESULT)
        message.success('日志解析完成 (使用默认数据)')
      }
    } catch {
      // 组件已卸载则不更新状态
      if (!isMountedRef.current) return

      message.error('日志解析失败，请稍后重试')
      // 出错时使用默认数据
      setParseResult(MOCK_RESULT)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [inputText, clearAllTimeouts])

  const handleDispatch = useCallback(
    (content: string) => {
      goToDispatch(content)
      message.loading('正在同步至分派台...', 0.5)
    },
    [goToDispatch]
  )

  return {
    loading,
    currentStep,
    parseResult,
    inputText,
    setInputText,
    handleParse,
    handleDispatch,
  }
}
