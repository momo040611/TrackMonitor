import type { PageViewEvent } from '../types'
import { trackBehavior } from '../utils/trackBehavior'

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
  let reportTimer: number | null = null

  // 路由处理逻辑
  const handleRouteChange = (): void => {
    if (reportTimer !== null) {
      clearTimeout(reportTimer)
    }

    reportTimer = window.setTimeout(() => {
      const currentRoute = getRouteInfo()

      // 如果已初始化且 URL 无变化，则跳过（去重）
      if (initialized && prevRoute.fullUrl === currentRoute.fullUrl) {
        reportTimer = null
        return
      }

      // 计算 referrer：首屏使用 document.referrer，后续跳转使用上一个页面的 URL
      const customReferrer = initialized ? prevRoute.fullUrl : undefined
      reportPageView(customReferrer)

      // 更新状态
      prevRoute = currentRoute
      initialized = true
      reportTimer = null
    }, 0)
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
    // 清除待上报任务
    if (reportTimer !== null) {
      clearTimeout(reportTimer)
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

  // 立即执行一次检测
  handleRouteChange()

  // 返回清理函数
  return () => {
    if (reportTimer !== null) {
      clearTimeout(reportTimer)
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
