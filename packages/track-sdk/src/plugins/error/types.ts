export enum ErrorType {
  JS = 'js',
  PROMISE = 'promise',
  RESOURCE = 'resource',
  HTTP = 'http',
  MANUAL = 'manual',
}

export interface ErrorPluginOptions {
  tracker?: any 
  
  /** 是否捕获JavaScript运行时错误 */
  jsError?: boolean
  /** 是否捕获Promise未处理异常 */
  promiseError?: boolean
  /** 是否捕获资源加载错误 */
  resourceError?: boolean
  /** 是否捕获HTTP请求错误 */
  httpError?: boolean
  /** 错误采样率 (0-1) */
  samplingRate?: number
  /** 最大错误上报数量 */
  maxErrorCount?: number
  /** 忽略的错误信息列表 */
  ignoreErrors?: Array<string | RegExp>
  /** 自定义错误过滤规则 */
  rules?: Array<(errorInfo: ErrorInfo) => boolean>
}

export interface ErrorInfo {
  type: ErrorType
  message: string
  stack: string
  time: number
  pageInfo: {
    url: string
    title: string
    referrer: string
  }
  userAgent: string
  detail: Record<string, any>
}