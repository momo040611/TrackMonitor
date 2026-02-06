import { PerformanceMetricType, PageLoadMetrics } from '../types'
/**
 * 页面加载性能处理器类型
 */
export type PageLoadMetricsHandler = (
  metricType: PerformanceMetricType,
  metrics: PageLoadMetrics,
  metadata?: Record<string, any>
) => void
/**
 * 初始化页面加载性能监控
 * @param handler 性能指标处理函数
 * @returns 移除监听的函数
 */
export function initPageLoadMetrics(handler: PageLoadMetricsHandler): () => void {
  /**
   * 收集浏览器Performance API数据
   */
  const collectNavigationTiming = (): PageLoadMetrics | null => {
    // 确保Performance API可用
    if (!window.performance || !window.performance.timing) {
      console.warn('[TraceSDK][PageLoadMetrics] Performance API不可用')
      return null
    }

    // 获取导航性能数据
    const timing = window.performance.timing
    const navStart = timing.navigationStart

    // 检查性能数据是否已经准备好
    if (timing.loadEventEnd === 0) {
      return null
    }

    // 计算关键性能时间点，相对于navigationStart
    const metrics: PageLoadMetrics = {
      // 基准时间点
      navigationStart: 0,

      // 核心指标
      domComplete: timing.domComplete - navStart,
      domInteractive: timing.domInteractive - navStart,
      loadComplete: timing.loadEventEnd - navStart,

      // 资源统计信息
      totalDownloadSize: 0,
      resourceCount: 0,
    }

    // 收集资源信息
    if (window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource')
      metrics.resourceCount = resources.length

      // 计算总下载大小
      metrics.totalDownloadSize = resources.reduce((total, resource: any) => {
        return total + (resource.transferSize || 0)
      }, 0)
    }

    // 收集绘制性能指标
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint')

      for (const entry of paintEntries) {
        const paintEntry = entry as PerformanceEntry
        if (paintEntry.name === 'first-paint') {
          metrics.firstPaint = paintEntry.startTime
        } else if (paintEntry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = paintEntry.startTime
        }
      }
    }

    // 收集Web Vitals指标
    collectWebVitals(metrics)

    return metrics
  }

  /**
   * 收集Web Vitals指标
   */
  const collectWebVitals = (metrics: PageLoadMetrics): void => {
    if (!('PerformanceObserver' in window)) {
      return
    }

    try {
      // 使用单个PerformanceObserver监听所有Web Vitals指标
      const vitalsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()

        entries.forEach((entry) => {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              // 最大内容绘制 - 使用最新的条目
              metrics.largestContentfulPaint = entry.startTime
              break

            case 'first-input':
              if (!metrics.firstInputDelay) {
                const firstInput = entry as any
                metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime
              }
              break

            case 'layout-shift':
              // 累计布局偏移 - 累加所有有效值
              const layoutShift = entry as any
              if (!layoutShift.hadRecentInput) {
                metrics.cumulativeLayoutShift =
                  (metrics.cumulativeLayoutShift || 0) + layoutShift.value
              }
              break
          }
        })
      })

      // 监听所有Web Vitals类型的性能条目
      vitalsObserver.observe({
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
        buffered: true,
      })
    } catch (error) {
      console.error('[TraceSDK][PageLoadMetrics] 监听Web Vitals指标失败:', error)
    }
  }

  /**
   * 页面加载完成后收集性能数据
   */
  const collectMetricsOnLoad = () => {
    // 确保页面已完全加载
    if (document.readyState !== 'complete') {
      return
    }

    // 延迟执行，确保所有性能数据都已生成
    setTimeout(() => {
      const metrics = collectNavigationTiming()
      if (metrics) {
        // 收集元数据
        const metadata = {
          url: window.location.href,
          documentReadyState: document.readyState,
          timestamp: Date.now(),
        }

        // 调用处理器函数
        handler(PerformanceMetricType.PAGE_LOAD, metrics, metadata)
      }
    }, 300)
  }

  // 如果页面已加载完成，直接收集
  if (document.readyState === 'complete') {
    collectMetricsOnLoad()
  } else {
    // 否则在load事件后收集
    window.addEventListener('load', collectMetricsOnLoad)
  }

  // 返回移除监听的函数
  return () => {
    window.removeEventListener('load', collectMetricsOnLoad)
  }
}
