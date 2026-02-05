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
  // 检查浏览器环境
  if (typeof window === 'undefined' || typeof XMLHttpRequest === 'undefined') {
    return () => {}
  }

  let originalXHROpen: any = null
  let originalXHRSend: any = null
  let originalFetch: any = null

  try {
    // 拦截 XMLHttpRequest
    originalXHROpen = XMLHttpRequest.prototype.open
    originalXHRSend = XMLHttpRequest.prototype.send

    if (typeof originalXHROpen === 'function' && typeof originalXHRSend === 'function') {
      XMLHttpRequest.prototype.open = function (
        method: string,
        url: string,
        async: boolean = true,
        username?: string | null,
        password?: string | null
      ) {
        try {
          this._method = method
          this._url = url
          return originalXHROpen.call(this, method, url, async, username, password)
        } catch (err) {
          console.error('[track-sdk] 拦截XMLHttpRequest.open时发生异常:', err)
          return originalXHROpen.call(this, method, url, async, username, password)
        }
      }

      XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
        try {
          const xhr = this
          const startTime = Date.now()

          xhr.addEventListener('readystatechange', function () {
            try {
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
            } catch (err) {
              console.error('[track-sdk] 处理XMLHttpRequest事件时发生异常:', err)
            }
          })

          return originalXHRSend.call(this, body)
        } catch (err) {
          console.error('[track-sdk] 拦截XMLHttpRequest.send时发生异常:', err)
          return originalXHRSend.call(this, body)
        }
      }
    }

    // 拦截 fetch
    if (typeof window.fetch === 'function') {
      originalFetch = window.fetch
      window.fetch = function (input: URL | RequestInfo, init?: RequestInit) {
        try {
          const startTime = Date.now()
          const requestUrl =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.href
                : (input as Request).url
          const requestMethod = init?.method || (input instanceof Request ? input.method : 'GET')

          return originalFetch
            .apply(this, [input, init])
            .then((response: Response) => {
              try {
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
              } catch (err) {
                console.error('[track-sdk] 处理fetch响应时发生异常:', err)
                return response
              }
            })
            .catch((error: Error) => {
              try {
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
              } catch (err) {
                console.error('[track-sdk] 处理fetch错误时发生异常:', err)
              }

              throw error
            })
        } catch (err) {
          console.error('[track-sdk] 拦截fetch时发生异常:', err)
          return originalFetch.apply(this, [input, init])
        }
      }
    }
  } catch (err) {
    console.error('[track-sdk] 初始化HTTP错误拦截时发生异常:', err)
  }

  return () => {
    try {
      // 恢复原始方法
      if (originalXHROpen && typeof originalXHROpen === 'function') {
        XMLHttpRequest.prototype.open = originalXHROpen
      }
      if (originalXHRSend && typeof originalXHRSend === 'function') {
        XMLHttpRequest.prototype.send = originalXHRSend
      }
      if (originalFetch && typeof originalFetch === 'function') {
        window.fetch = originalFetch
      }
    } catch (err) {
      console.error('[track-sdk] 恢复原始HTTP方法时发生异常:', err)
    }
  }
}
