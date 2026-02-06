import { ErrorType } from '../types'

export function initPromiseError(
  callback: (
    errorType: ErrorType,
    error: PromiseRejectionEvent,
    metadata?: Record<string, any>
  ) => void
): () => void {
  // 检查浏览器环境
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return () => {}
  }

  const rejectionHandler = (event: PromiseRejectionEvent): void => {
    try {
      event.preventDefault()

      const metadata = {
        timestamp: Date.now(),
        url: window.location.href,
      }

      callback(ErrorType.PROMISE, event, metadata)
    } catch (err) {
      console.error('[track-sdk] 处理Promise错误时发生异常:', err)
    }
  }

  window.addEventListener('unhandledrejection', rejectionHandler)

  return () => {
    try {
      window.removeEventListener('unhandledrejection', rejectionHandler)
    } catch (err) {
      console.error('[track-sdk] 移除Promise错误监听器时发生异常:', err)
    }
  }
}
