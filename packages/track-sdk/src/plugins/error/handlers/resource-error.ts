import { ErrorType } from '../types'

export function initResourceError(
  callback: (errorType: ErrorType, error: ErrorEvent, metadata?: Record<string, any>) => void
): () => void {
  // 检查浏览器环境
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return () => {}
  }

  const resourceHandler = (event: ErrorEvent): void => {
    try {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG')
      ) {
        let resourceUrl: string = ''
        if (target.tagName === 'IMG' || target.tagName === 'SCRIPT') {
          resourceUrl = (target as HTMLImageElement | HTMLScriptElement).src
        } else if (target.tagName === 'LINK') {
          resourceUrl = (target as HTMLLinkElement).href
        }

        const metadata = {
          timestamp: Date.now(),
          url: window.location.href,
          resourceUrl,
          resourceType: target.tagName.toLowerCase(),
        }

        callback(ErrorType.RESOURCE, event, metadata)
      }
    } catch (err) {
      console.error('[track-sdk] 处理资源错误时发生异常:', err)
    }
  }

  window.addEventListener('error', resourceHandler, true)

  return () => {
    try {
      window.removeEventListener('error', resourceHandler, true)
    } catch (err) {
      console.error('[track-sdk] 移除资源错误监听器时发生异常:', err)
    }
  }
}
