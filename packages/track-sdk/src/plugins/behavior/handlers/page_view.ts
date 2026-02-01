import type { PageViewEvent } from '../types'
import { trackBehavior } from '../utils/trackBehavior'

interface RouteInfo {
  path: string
  fullUrl: string
  title: string
}

function getRouteInfo(): RouteInfo {
  return {
    path: window.location.pathname,
    fullUrl: window.location.href,
    title: document.title,
  }
}

function getPageInfo(customReferrer?: string): PageViewEvent {
  return {
    page_name: document.title,
    page_url: window.location.href,
    referrer: customReferrer || document.referrer,
  }
}

function reportPageView(data: PageViewEvent): void {
  try {
    trackBehavior('page_view', data)
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
  let pageStartTime = Date.now()

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

      if (initialized) {
        reportPageView({
          page_name: prevRoute.title,
          page_url: prevRoute.fullUrl,
          duration: Date.now() - pageStartTime,
        })
      }

      reportPageView(getPageInfo(customReferrer))

      prevRoute = currentRoute
      initialized = true
      pageStartTime = Date.now()
      reportTimer = null
    }, 0)
  }

  const handleLoad = (event: Event) => {
    handleRouteChange()
  }
  window.addEventListener('load', handleLoad)

  const handlePopState = (event: PopStateEvent) => {
    handleRouteChange()
  }
  window.addEventListener('popstate', handlePopState)

  const handleHashChange = (event: HashChangeEvent) => {
    handleRouteChange()
  }
  window.addEventListener('hashchange', handleHashChange)

  const handleUnload = () => {
    if (initialized) {
      reportPageView({
        page_name: prevRoute.title,
        page_url: prevRoute.fullUrl,
        duration: Date.now() - pageStartTime,
      })
    }

    if (reportTimer !== null) {
      clearTimeout(reportTimer)
    }
  }
  window.addEventListener('beforeunload', handleUnload)

  const originalPushState = history.pushState
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args)
    handleRouteChange()
    return result
  }

  const originalReplaceState = history.replaceState
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args)
    handleRouteChange()
    return result
  }

  handleRouteChange()

  return () => {
    if (reportTimer !== null) {
      clearTimeout(reportTimer)
    }

    window.removeEventListener('load', handleLoad)
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('hashchange', handleHashChange)
    window.removeEventListener('beforeunload', handleUnload)

    history.pushState = originalPushState
    history.replaceState = originalReplaceState
  }
}
