import { ErrorType } from '../types'

export function initJsError(
  callback: (errorType: ErrorType, error: ErrorEvent, metadata?: Record<string, any>) => void
): () => void {
  // 检查浏览器环境
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return () => {}
  }

  const errorHandler = (event: ErrorEvent): void => {
    console.log('浏览器捕获到原生错误:', event.message)
    try {
      // event.preventDefault()

      const metadata = {
        timestamp: Date.now(),
        url: window.location.href,
      }

      callback(ErrorType.JS, event, metadata)
    } catch (err) {
      console.error('[track-sdk] 处理JS错误时发生异常:', err)
    }
  }

  window.addEventListener('error', errorHandler, true)

  return () => {
    try {
      window.removeEventListener('error', errorHandler, true)
    } catch (err) {
      console.error('[track-sdk] 移除JS错误监听器时发生异常:', err)
    }
  }
}
