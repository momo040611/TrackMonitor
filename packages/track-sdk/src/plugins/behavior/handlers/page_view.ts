import type { PageViewEvent } from '../types'
import { trackBehavior } from '../api/trackBehavior'

export type HandlerReport = (eventName: string, payload?: unknown) => void

interface RouteInfo {
  path: string
  fullUrl: string
}

function getRouteInfo(): RouteInfo {
  return {
    path: window.location.pathname,
    fullUrl: window.location.href,
  }
}

function getPageInfo(customReferrer?: string): PageViewEvent {
  return {
    page_name: document.title,
    page_url: window.location.href,
    referrer: customReferrer || document.referrer,
  }
}

function reportPageView(customReferrer?: string): void {
  try {
    const pageInfo = getPageInfo(customReferrer)
    trackBehavior('page_view', pageInfo)
  } catch (error) {
    console.error('[TrackSDK][PageView] 上报页面浏览事件错误:', error)
  }
}

/**
 * 初始化页面浏览追踪
 * @returns 清理函数
 */
export function initPageViewHandler(): () => void {
  let prevRoute: RouteInfo = getRouteInfo()
  let initialized = false
  let debounceTimer: number | null = null

  const handleRouteChange = (): void => {
    // 清除之前的防抖定时器
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }

    // 设置 100ms 防抖
    debounceTimer = window.setTimeout(() => {
      const currentRoute = getRouteInfo()

      // 去重：URL 未变化则不上报
      if (initialized && prevRoute.fullUrl === currentRoute.fullUrl) {
        return
      }

      // 上报当前页面浏览事件，传入上一个页面的 URL 作为 referrer
      const customReferrer = initialized ? prevRoute.fullUrl : undefined
      reportPageView(customReferrer)

      // 更新状态
      prevRoute = currentRoute
      initialized = true
      debounceTimer = null
    }, 100)
  }

  // 监听页面加载
  const handleLoad = (event: Event) => {
    handleRouteChange()
  }
  window.addEventListener('load', handleLoad)

  // 监听浏览器前进/后退
  const handlePopState = (event: PopStateEvent) => {
    handleRouteChange()
  }
  window.addEventListener('popstate', handlePopState)

  // 监听 hash 路由变化
  const handleHashChange = (event: HashChangeEvent) => {
    handleRouteChange()
  }
  window.addEventListener('hashchange', handleHashChange)

  // 监听页面卸载
  const handleUnload = () => {
    // 清除防抖定时器
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }
  }
  window.addEventListener('beforeunload', handleUnload)

  // 劫持 history.pushState
  const originalPushState = history.pushState
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args)
    handleRouteChange()
    return result
  }

  // 劫持 history.replaceState
  const originalReplaceState = history.replaceState
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args)
    handleRouteChange()
    return result
  }

  return () => {
    // 清除防抖定时器
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }

    // 移除事件监听
    window.removeEventListener('load', handleLoad)
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('hashchange', handleHashChange)
    window.removeEventListener('beforeunload', handleUnload)

    // 恢复原始方法
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
  }
}
