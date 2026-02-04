import { ErrorType } from '../types'

export function initPromiseError(
  callback: (
    errorType: ErrorType,
    error: PromiseRejectionEvent,
    metadata?: Record<string, any>
  ) => void
): () => void {
  const rejectionHandler = (event: PromiseRejectionEvent): void => {
    event.preventDefault()

    const metadata = {
      timestamp: Date.now(),
      url: window.location.href,
    }

    callback(ErrorType.PROMISE, event, metadata)
  }

  window.addEventListener('unhandledrejection', rejectionHandler)

  return () => {
    window.removeEventListener('unhandledrejection', rejectionHandler)
  }
}
