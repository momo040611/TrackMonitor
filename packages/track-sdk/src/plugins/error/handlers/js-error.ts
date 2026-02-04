import { ErrorType } from '../types'

export function initJsError(
  callback: (errorType: ErrorType, error: ErrorEvent, metadata?: Record<string, any>) => void
): () => void {
  const errorHandler = (event: ErrorEvent): void => {
    event.preventDefault()

    const metadata = {
      timestamp: Date.now(),
      url: window.location.href,
    }

    callback(ErrorType.JS, event, metadata)
  }

  window.addEventListener('error', errorHandler, true)

  return () => {
    window.removeEventListener('error', errorHandler, true)
  }
}
