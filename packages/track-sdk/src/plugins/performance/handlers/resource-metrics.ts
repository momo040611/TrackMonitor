import type { PerformanceHandler, ResourceTimingData } from '../types'
// PerformanceHandler: 处理器接口类型   ResourceTimingData: 资源计时数据类型

export interface ResourceMetricsHandlerOptions {
  maxResources?: number // 最多监控多少个资源
  slowResourceThreshold?: number // 慢资源阈值（ms）
}

export function createResourceMetricsHandler(
  options: ResourceMetricsHandlerOptions = {}
): PerformanceHandler {
  const { maxResources = 100, slowResourceThreshold = 2000 } = options

  let context: any = null // 添加 context 存储

  return {
    name: 'resource-metrics',

    init(ctx: any): void {
      context = ctx // 存储 context

      if (typeof window === 'undefined' || !window.performance) {
        return
      }

      if (window.PerformanceObserver) {
        const self = this
        const observer = new PerformanceObserver((list) => {
          const resourceEntries = list.getEntriesByType('resource')
          self.processResourceEntries(resourceEntries)
        })

        observer.observe({
          entryTypes: ['resource'],
        })
      }
    },

    processResourceEntries(entries: PerformanceResourceTiming[]): void {
      if (!context) {
        return
      }

      const processedEntries = entries.slice(0, maxResources).map((entry) => {
        const resourceData: ResourceTimingData = {
          name: entry.name,
          initiatorType: entry.initiatorType,
          duration: entry.duration,
          fetchStart: entry.fetchStart,
          domainLookupStart: entry.domainLookupStart,
          domainLookupEnd: entry.domainLookupEnd,
          connectStart: entry.connectStart,
          connectEnd: entry.connectEnd,
          requestStart: entry.requestStart,
          responseStart: entry.responseStart,
          responseEnd: entry.responseEnd,
          isSlow: entry.duration > slowResourceThreshold,
        }

        resourceData.timings = {
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          tcp: entry.connectEnd - entry.connectStart,
          ttfb: entry.responseStart - entry.requestStart,
          response: entry.responseEnd - entry.responseStart,
          total: entry.duration,
        }

        return resourceData
      })

      if (processedEntries.length > 0) {
        context?.sendEvent?.('resource-metrics', {
          resources: processedEntries,
          totalResources: processedEntries.length,
          slowResources: processedEntries.filter((r) => r.isSlow).length,
        })
      }
    },

    sendEvent(eventType: string, data: any): void {
      if (context && context.send) {
        context.send({
          type: eventType,
          data: data,
          timestamp: Date.now(),
        })
      }
    },
  }
}

/** 
使用 PerformanceObserver 监听资源加载事件
处理 resource 类型的性能条目，提取详细的资源加载时序数据
计算资源加载各阶段的时间消耗（DNS、TCP、TTFB、响应等）
识别慢资源（超过阈值的资源）
提供资源加载的完整瀑布图数据
这个模块将帮助您监控和分析页面中各类资源的加载性能，识别潜在的性能瓶颈。
完成这个模块后，我们将继续实现性能监控器模块。
*/
