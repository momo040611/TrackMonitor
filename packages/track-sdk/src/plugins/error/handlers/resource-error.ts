import { ErrorType } from '../types'

export function initResourceError(
  callback: (errorType: ErrorType, error: ErrorEvent, metadata?: Record<string, any>) => void
): () => void {
  const resourceHandler = (event: ErrorEvent): void => {
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
  }

  window.addEventListener('error', resourceHandler, true)

  return () => {
    window.removeEventListener('error', resourceHandler, true)
  }
}
