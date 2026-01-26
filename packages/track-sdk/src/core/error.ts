import { getCommonContext, trackEvent } from './tracker';

// 错误事件名
export type ErrorEventNames =
  | 'error_js'
  | 'error_promise'
  | 'error_resource'
  | 'error_api'
  | 'error_business';

// 各类错误参数
export interface ErrorJsEvent {
  page_name?: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}

export interface ErrorPromiseEvent {
  page_name?: string;
  reason: string;
  stack?: string;
}

export interface ErrorResourceEvent {
  page_name?: string;
  resource_url: string;
  resource_type: string;
}

export interface ErrorApiEvent {
  page_name?: string;
  request_url: string;
  method: string;
  status_code?: number;
  error_message?: string;
}

export interface ErrorBusinessEvent {
  page_name?: string;
  biz_code: string;
  message: string;
  detail?: any;
}

export interface ErrorEventMap {
  error_js: ErrorJsEvent;
  error_promise: ErrorPromiseEvent;
  error_resource: ErrorResourceEvent;
  error_api: ErrorApiEvent;
  error_business: ErrorBusinessEvent;
}

/**
 * 错误埋点统一入口
 */
export function trackError<T extends ErrorEventNames>(
  eventName: T,
  params: ErrorEventMap[T]
): void {
  const context = getCommonContext();
  const payload = {
    ...context,
    ...params,
  };
  trackEvent(eventName, payload);
}