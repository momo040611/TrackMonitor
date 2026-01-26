import { getCommonContext, trackEvent } from './tracker';

// 性能事件名
export type PerformanceEventNames =
  | 'perf_page_load'
  | 'perf_paint'
  | 'perf_resource'
  | 'perf_api'
  | 'perf_custom';

// 性能事件参数
export interface PerfPageLoadEvent {
  page_name?: string;
  page_url?: string;
  time_to_first_byte?: number;
  dom_content_loaded?: number;
  load_event?: number;
}

export interface PerfPaintEvent {
  page_name?: string;
  page_url?: string;
  fp?: number;
  fcp?: number;
  lcp?: number;
}

export interface PerfResourceEvent {
  name: string;
  initiator_type: string;
  duration: number;
  transfer_size?: number;
}

export interface PerfApiEvent {
  url: string;
  method: string;
  status_code: number;
  duration: number;
}

export interface PerfCustomEvent {
  label: string;
  duration: number;
  page_name?: string;
  extra?: Record<string, any>;
}

export interface PerformanceEventMap {
  perf_page_load: PerfPageLoadEvent;
  perf_paint: PerfPaintEvent;
  perf_resource: PerfResourceEvent;
  perf_api: PerfApiEvent;
  perf_custom: PerfCustomEvent;
}

/**
 * 性能埋点统一入口
 */
export function trackPerformance<T extends PerformanceEventNames>(
  eventName: T,
  params: PerformanceEventMap[T]
): void {
  const context = getCommonContext();
  const payload = {
    ...context,
    ...params,
  };
  trackEvent(eventName, payload);
}

// 简单自定义计时器实现
const timingMap = new Map<string, number>();

export function startTiming(label: string): void {
  timingMap.set(label, performance.now());
}

export function endTiming(label: string, extra?: Record<string, any>): void {
  const start = timingMap.get(label);
  if (start == null) return;
  timingMap.delete(label);
  const duration = performance.now() - start;
  const context = getCommonContext();
  const payload: PerfCustomEvent = {
    label,
    duration,
    page_name: context.page_name,
    extra,
  };
  trackPerformance('perf_custom', payload);
}