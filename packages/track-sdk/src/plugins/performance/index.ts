import type { TrackerPlugin } from '../../core'

export interface PerformancePluginOptions {
  // 预留：比如是否自动打点首屏、LCP 等
}

export function createPerformancePlugin(_options: PerformancePluginOptions = {}): TrackerPlugin {
  return {
    name: 'performance',
    setup() {
      // 初始化性能监控（PerformanceObserver 等）
    },
    onEvent() {
      // 性能相关事件处理入口
    },
  }
}
