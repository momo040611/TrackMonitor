import type { PerformanceHandler } from '../types'
import { initPageLoadMetrics } from './page-load-metrics'
import { createResourceMetricsHandler } from './resource-metrics'

export interface HandlerManagerOptions {
  enablePageLoadMetrics?: boolean
  enableResourceMetrics?: boolean
}

export class HandlerManager {
  private handlers: PerformanceHandler[] = []

  constructor(options: HandlerManagerOptions = {}) {
    const { enablePageLoadMetrics = true, enableResourceMetrics = true } = options

    if (enablePageLoadMetrics) {
      this.registerHandler(createPageLoadMetricsHandler())
    }

    if (enableResourceMetrics) {
      this.registerHandler(createResourceMetricsHandler())
    }
  }

  registerHandler(handler: PerformanceHandler): void {
    this.handlers.push(handler)
  }

  init(context: any): void {
    this.handlers.forEach((handler) => {
      handler.init?.(context)
    })
  }

  getHandlers(): PerformanceHandler[] {
    return this.handlers
  }
}

export function createHandlerManager(options?: HandlerManagerOptions): HandlerManager {
  return new HandlerManager(options)
}

// ✅ 修复：实现页面加载性能处理器
function createPageLoadMetricsHandler(): PerformanceHandler {
  return {
    name: 'page-load-metrics',
    // 为了满足接口定义的占位属性（如果有的话）
    processResourceEntries: undefined,

    init(context: any) {
      // 调用 page-load-metrics.ts 里的初始化函数
      initPageLoadMetrics((metricType, metrics, metadata) => {
        // 当采集到性能数据时，通过 context.send 发送给 PerformanceMonitor
        if (context && context.send) {
          context.send({
            type: metricType,
            name: 'page_load', // 指标名称
            metrics: metrics, // 具体数值 (FCP, LCP 等)
            metadata: metadata,
          })
        }
      })
    },
  }
}
