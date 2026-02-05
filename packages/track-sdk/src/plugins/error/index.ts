import type { TrackerPlugin, CoreContext, TrackerEvent } from '../../core'
import { initJsError, initPromiseError, initResourceError, initHttpError } from './handlers'
import { ErrorType, ErrorPluginOptions, ErrorInfo } from './types'

/**
 * 创建错误插件的函数式实现
 * @param options 配置选项
 * @returns 错误插件实例
 */
/**
 * 错误插件实例接口，包含基本功能和高级功能
 */
export interface ErrorPluginInstance extends TrackerPlugin {
  /**
   * 暂停错误监控
   */
  pause(): void

  /**
   * 恢复错误监控
   */
  resume(): void

  /**
   * 手动捕获错误
   * @param error 错误对象
   * @param metadata 附加元数据
   */
  captureError(error: Error, metadata?: Record<string, any>): void

  /**
   * 获取错误计数
   * @returns 错误计数
   */
  getErrorCount(): number

  /**
   * 重置错误计数
   */
  resetErrorCount(): void

  /**
   * 获取当前配置
   * @returns 配置选项
   */
  getConfig(): ErrorPluginOptions

  /**
   * 更新配置
   * @param options 配置选项
   */
  updateConfig(options: Partial<ErrorPluginOptions>): void
}

/**
 * 创建错误插件实例
 * @param options 配置选项
 * @returns 错误插件实例
 */
export function createErrorPlugin(options: ErrorPluginOptions = {}): ErrorPluginInstance {
  let config: ErrorPluginOptions = {
    jsError: true,
    promiseError: true,
    resourceError: true,
    httpError: false,
    samplingRate: 1.0,
    maxErrorCount: 100,
    ignoreErrors: [],
    rules: [],
    ...options,
  }

  let errorCount = 0
  let enabled = true
  let removeHandlers: Array<() => void> = []
  let trackerInstance: any = options.tracker || null
  
  const handleError = (
    errorType: ErrorType,
    error: Error | ErrorEvent | PromiseRejectionEvent | Event | any,
    metadata?: Record<string, any>
  ): void => {
    if (!enabled) return

    // 控制采样率
    if (Math.random() > (config.samplingRate || 1.0)) return

    // 控制错误数量
    if (config.maxErrorCount && errorCount >= config.maxErrorCount) {
      if (errorCount === config.maxErrorCount) {
        console.warn(`[track-sdk] 错误数量已达上限 ${config.maxErrorCount}，后续错误将被忽略`)
        errorCount++
      }
      return
    }

    try {
      // 提取错误信息
      const errorInfo = extractErrorInfo(errorType, error, metadata)

      // 应用过滤规则
      if (shouldIgnoreError(errorInfo)) {
        return
      }

      // 上报错误
      reportError(errorInfo)
      errorCount++
    } catch (e) {
      console.error(`[track-sdk] 处理错误时发生异常: ${e}`)
    }
  }

  const extractErrorInfo = (
    errorType: ErrorType,
    error: Error | ErrorEvent | PromiseRejectionEvent | Event | any,
    metadata?: Record<string, any>
  ): ErrorInfo => {
    let message = ''
    let stack = ''
    let detail: Record<string, any> = {}

    try {
      // 检查错误对象类型，避免访问不存在的属性
      if (error instanceof Error) {
        message = error.message
        stack = error.stack || ''
        detail = { name: error.name }
      } else if (error && typeof error === 'object') {
        // 处理 ErrorEvent
        if (error instanceof ErrorEvent) {
          message = error.message
          stack = (error as any).error?.stack || ''
          detail = {
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno,
          }
        }
        // 处理 PromiseRejectionEvent
        else if (error instanceof PromiseRejectionEvent) {
          const reason = error.reason
          message = reason instanceof Error ? reason.message : String(reason)
          stack = reason instanceof Error ? reason.stack || '' : ''
          detail = { type: 'unhandled promise rejection' }
        }
        // 处理 Event
        else if (error instanceof Event) {
          message = error.type
          detail = {
            target: (error.target as HTMLElement)?.outerHTML?.slice(0, 200) || '不可序列化目标',
          }
        }
        // 处理 HTTP 错误
        else if (error.type === 'http_error') {
          message = `HTTP Error ${error.status || 'unknown'}: ${error.url || 'unknown'}`
          detail = {
            status: error.status,
            url: error.url,
            method: error.method,
          }
        }
        // 处理其他对象
        else {
          message = String(error)
          detail = { type: 'unknown error' }
        }
      } else {
        // 处理非对象类型的错误
        message = String(error)
        detail = { type: 'unknown error' }
      }
    } catch (err) {
      console.error('[track-sdk] 提取错误信息时发生异常:', err)
      message = 'Failed to extract error information'
      detail = { type: 'extraction_error', originalError: String(err) }
    }

    // 非浏览器环境安全降级
    let pageInfo: { url: string; title: string; referrer: string } = {
      url: '',
      title: '',
      referrer: '',
    }
    let userAgent = ''

    // 仅在浏览器环境下访问浏览器 API
    if (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      typeof navigator !== 'undefined'
    ) {
      try {
        pageInfo = {
          url: window.location?.href || '',
          title: document.title || '',
          referrer: document.referrer || '',
        }
        userAgent = navigator.userAgent || ''
      } catch (err) {
        console.error('[track-sdk] 获取浏览器信息时发生异常:', err)
      }
    }

    return {
      type: errorType,
      message,
      stack,
      time: Date.now(),
      pageInfo,
      userAgent,
      detail: {
        ...detail,
        ...metadata,
      },
    }
  }

  const shouldIgnoreError = (errorInfo: ErrorInfo): boolean => {
    // 检查忽略列表
    if (config.ignoreErrors) {
      for (const pattern of config.ignoreErrors) {
        if (typeof pattern === 'string' && errorInfo.message.includes(pattern)) {
          return true
        }
        if (pattern instanceof RegExp && pattern.test(errorInfo.message)) {
          return true
        }
      }
    }

    // 应用自定义规则
    if (config.rules && config.rules.length > 0) {
      for (const rule of config.rules) {
        if (rule(errorInfo) === false) {
          return true
        }
      }
    }

    return false
  }

  const reportError = (errorInfo: ErrorInfo): void => {
    try {
      console.log('[track-sdk] 上报错误:', errorInfo)

      // 这里可以通过tracker实例上报错误
      if (
        trackerInstance &&
        typeof trackerInstance === 'object' &&
        typeof trackerInstance.track === 'function'
      ) {
        const eventName = `error_${errorInfo.type}`;
       
        trackerInstance.track(`error_${errorInfo.type}`, errorInfo)
      }
    } catch (err) {
      console.error('[track-sdk] 上报错误时发生异常:', err)
    }
  }

  const installErrorHandlers = (): void => {
    // 更全面的浏览器环境检查
    const isBrowser =
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      typeof navigator !== 'undefined'
    if (!isBrowser) return

    try {
      // 安装JavaScript错误监听
      if (config.jsError) {
        const removeJsError = initJsError(handleError)
        removeHandlers.push(removeJsError)
      }

      // 安装Promise错误监听
      if (config.promiseError) {
        const removePromiseError = initPromiseError(handleError)
        removeHandlers.push(removePromiseError)
      }

      // 安装资源错误监听
      if (config.resourceError) {
        const removeResourceError = initResourceError(handleError)
        removeHandlers.push(removeResourceError)
      }

      // 安装HTTP错误监听
      if (config.httpError) {
        const removeHttpError = initHttpError(handleError)
        removeHandlers.push(removeHttpError)
      }
    } catch (error) {
      console.error(`[track-sdk] 安装错误处理器失败: ${error}`)
    }
  }

  const removeAllErrorHandlers = (): void => {
    removeHandlers.forEach((remove) => {
      try {
        remove()
      } catch (error) {
        console.error(`[track-sdk] 移除错误处理器失败: ${error}`)
      }
    })
    removeHandlers = []
  }

  return {
    name: 'error',
    setup(context: CoreContext) {
     try {
        // 如果 options 没传 tracker，才尝试从 context 里找 
        if (!trackerInstance && context && typeof context === 'object') {
          const ctx = context as Record<string, any>
          if (ctx.tracker) {
            trackerInstance = ctx.tracker
          }
        }

        installErrorHandlers()
        console.log('[track-sdk] 错误监控插件初始化完成')
      } catch (err) {
        console.error('[track-sdk] 错误监控插件初始化失败:', err)
      }
    },
    onEvent(event: TrackerEvent, context: CoreContext) {
      try {
        // 检查是否是从外部触发的错误事件
        if (event && typeof event === 'object' && event.type === 'error' && event.payload) {
          console.log('[track-sdk] 接收到错误事件:', event.payload)
        }
      } catch (err) {
        console.error('[track-sdk] 处理事件时发生异常:', err)
      }
    },
    cleanup() {
      removeAllErrorHandlers()
      console.log('[track-sdk] 错误监控插件已销毁')
    },
    // 高级功能
    pause() {
      enabled = false
      console.log('[track-sdk] 错误监控已暂停')
    },
    resume() {
      enabled = true
      console.log('[track-sdk] 错误监控已恢复')
    },
    captureError(error: Error, metadata?: Record<string, any>) {
      const errorInfo = extractErrorInfo(ErrorType.MANUAL, error, metadata)
      if (!shouldIgnoreError(errorInfo)) {
        reportError(errorInfo)
        errorCount++
      }
      console.log('[track-sdk] 手动捕获错误:', errorInfo)
    },
    getErrorCount() {
      return errorCount
    },
    resetErrorCount() {
      errorCount = 0
      console.log('[track-sdk] 错误计数已重置')
    },
    getConfig() {
      return { ...config }
    },
    updateConfig(options: Partial<ErrorPluginOptions>) {
      config = { ...config, ...options }
      console.log('[track-sdk] 错误监控配置已更新:', config)
    },
  }
}

/**
 * 手动捕获错误的函数（顶层便捷 API）
 * @param error 错误对象
 * @param metadata 附加元数据
 * @param options 错误插件配置选项
 */
export function captureError(
  error: Error,
  metadata?: Record<string, any>,
  options: Partial<ErrorPluginOptions> = {}
): void {
  try {
    // 验证 error 参数
    if (!error) {
      console.warn('[track-sdk] 捕获错误失败: error 参数为 undefined 或 null')
      return
    }

    // 创建临时的错误插件实例来处理错误
    const tempPlugin = createErrorPlugin(options)

    // 验证插件实例
    if (
      tempPlugin &&
      typeof tempPlugin === 'object' &&
      typeof tempPlugin.captureError === 'function'
    ) {
      // 使用插件实例的 captureError 方法
      tempPlugin.captureError(error, metadata)

      // 验证 cleanup 方法
      if (typeof tempPlugin.cleanup === 'function') {
        // 清理临时插件
        tempPlugin.cleanup()
      }
    } else {
      console.warn('[track-sdk] 捕获错误失败: 插件实例创建失败或缺少必要方法')
    }
  } catch (err) {
    console.error('[track-sdk] 捕获错误时发生异常:', err)
  }
}

// 导出类型定义
export * from './types'
