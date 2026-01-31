import type { BehaviorEventNames, BehaviorEventMap } from '../types'
import type { CommonContext } from './context'

/**
 * Tracker 实例引用
 */
let trackerInstance: { track: (type: string, payload?: unknown) => void } | null = null

/**
 * 全局上下文
 */
let globalContext: Partial<CommonContext> = {}

/**
 * 设置 Tracker 实例
 * @internal
 */
export function setTrackerInstance(instance: {
  track: (type: string, payload?: unknown) => void
}): void {
  trackerInstance = instance
}

/**
 * 设置全局上下文
 */
export function setGlobalContext(context: Partial<CommonContext>): void {
  globalContext = { ...globalContext, ...context }
}

/**
 * 获取通用上下文
 */
function getCommonContext(): CommonContext {
  return {
    ...globalContext,
    page_url: window.location.href,
    page_name: document.title,
    timestamp: Date.now(),
  }
}

/**
 * 上报事件
 */
function trackEvent(eventName: string, payload: unknown): void {
  if (!trackerInstance) {
    console.warn('[TrackSDK] Tracker 未初始化')
    return
  }
  trackerInstance.track(eventName, payload)
}

/**
行为埋点统一入口（手动埋点使用）
*/
export function trackBehavior<T extends BehaviorEventNames>(
  eventName: T,
  params: BehaviorEventMap[T]
): void {
  const context = getCommonContext()
  const payload = {
    ...context,
    ...params,
  }
  trackEvent(eventName, payload)
}
