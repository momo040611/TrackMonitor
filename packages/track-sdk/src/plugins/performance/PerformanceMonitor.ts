import { HandlerManager } from './handlers'
import { PerformanceMetricType } from './types'

export interface PerformanceMonitorOptions {
  enablePageLoadMetrics?: boolean
  enableResourceMetrics?: boolean
}

export class PerformanceMonitor {
  private handlerManager: HandlerManager
  private context: any
  private enabled: boolean = false

  constructor(options: PerformanceMonitorOptions = {}) {
    this.handlerManager = new HandlerManager({
      enablePageLoadMetrics: options.enablePageLoadMetrics,
      enableResourceMetrics: options.enableResourceMetrics,
    })
  }

  public init(context: any): void {
    this.context = context
    this.enabled = true

    // 初始化所有处理器
    this.handlerManager.init({
      send: (data: any) => {
        this.sendPerformanceData(data)
      },
    })

    console.log('[TraceSDK][PerformanceMonitor] 性能监控已初始化')
  }

  private sendPerformanceData(data: any): void {
    if (!this.enabled || !this.context) {
      return
    }

    // 发送性能数据到核心埋点系统
    this.context.send({
      type: `performance:${data.type || 'unknown'}`,
      data: data,
      timestamp: Date.now(),
    })
  }

  public destroy(): void {
    this.enabled = false
    this.context = undefined
    console.log('[TraceSDK][PerformanceMonitor] 性能监控已销毁')
  }
}

export function createPerformanceMonitor(
  options: PerformanceMonitorOptions = {}
): PerformanceMonitor {
  return new PerformanceMonitor(options)
}
