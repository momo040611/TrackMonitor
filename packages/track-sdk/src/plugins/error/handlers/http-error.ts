import { ErrorType } from '../types'

// 扩展XMLHttpRequest类型声明，添加_method和_url属性
declare global {
  interface XMLHttpRequest {
    _method?: string
    _url?: string
  }
}

export function initHttpError(
  callback: (errorType: ErrorType, error: any, metadata?: Record<string, any>) => void
): () => void {
  // 拦截 XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open
  const originalXHRSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string,
    async: boolean = true,
    username?: string | null,
    password?: string | null
  ) {
    this._method = method
    this._url = url
    return originalXHROpen.call(this, method, url, async, username, password)
  }

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const xhr = this
    const startTime = Date.now()

    xhr.addEventListener('readystatechange', function () {
      if (xhr.readyState === 4) {
        const endTime = Date.now()
        const status = xhr.status

        if (status >= 400) {
          const metadata = {
            timestamp: Date.now(),
            url: window.location.href,
            httpUrl: xhr._url,
            httpMethod: xhr._method,
            httpStatus: status,
            responseTime: endTime - startTime,
          }

          callback(
            ErrorType.HTTP,
            {
              type: 'http_error',
              target: xhr,
              status,
              url: xhr._url,
              method: xhr._method,
            },
            metadata
          )
        }
      }
    })

    return originalXHRSend.call(this, body)
  }

  // 拦截 fetch
  const originalFetch = window.fetch
  window.fetch = function (input: URL | RequestInfo, init?: RequestInit) {
    const startTime = Date.now()
    const requestUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url
    const requestMethod = init?.method || (input instanceof Request ? input.method : 'GET')

    return originalFetch
      .apply(this, [input, init])
      .then((response) => {
        const endTime = Date.now()
        const status = response.status

        if (status >= 400) {
          const metadata = {
            timestamp: Date.now(),
            url: window.location.href,
            httpUrl: requestUrl,
            httpMethod: requestMethod,
            httpStatus: status,
            responseTime: endTime - startTime,
          }

          callback(
            ErrorType.HTTP,
            {
              type: 'http_error',
              status,
              url: requestUrl,
              method: requestMethod,
            },
            metadata
          )
        }

        return response
      })
      .catch((error) => {
        const endTime = Date.now()
        const metadata = {
          timestamp: Date.now(),
          url: window.location.href,
          httpUrl: requestUrl,
          httpMethod: requestMethod,
          responseTime: endTime - startTime,
          error: error.message,
        }

        callback(
          ErrorType.HTTP,
          {
            type: 'http_error',
            error,
            url: requestUrl,
            method: requestMethod,
          },
          metadata
        )

        throw error
      })
  }

  return () => {
    // 恢复原始方法
    XMLHttpRequest.prototype.open = originalXHROpen
    XMLHttpRequest.prototype.send = originalXHRSend
    window.fetch = originalFetch
  }
}
