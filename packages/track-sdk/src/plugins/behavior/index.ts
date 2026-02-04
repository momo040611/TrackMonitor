import type { TrackerPlugin, CoreContext } from '../../core'
import { setTrackerInstance, setGlobalContext } from './utils/trackBehavior'
import { initClickHandler } from './handlers/button_click'
import { initGenerateClickHandler } from './handlers/generate_click'
import { initPageViewHandler } from './handlers/page_view'
import { initWorkClickHandler } from './handlers/work_click'
import { initExposureHandler } from './handlers/work_show'

// Tracker 接口，防止循环引用
export interface ITracker {
  track(type: string, payload?: unknown): void
}

export interface BehaviorPluginOptions {
  /**
   *  Tracker 实例引用
   */
  tracker: ITracker

  // 功能开关
  disableAutoTrack?: boolean
  disablePageView?: boolean
  disableClick?: boolean
  disableExposure?: boolean
}

export function createBehaviorPlugin(options: BehaviorPluginOptions): TrackerPlugin {
  // 注入 Tracker 实例
  if (options.tracker) {
    setTrackerInstance(options.tracker)
  } else {
    console.error('createBehaviorPlugin 必须传入 tracker 实例！')
  }

  // 存储清理函数
  const cleanups: (() => void)[] = []

  return {
    name: 'behavior',

    setup(context: CoreContext) {
      // 同步全局上下文
      setGlobalContext(context)

      // 初始化采集器
      if (!options.disableAutoTrack) {
        if (!options.disablePageView) cleanups.push(initPageViewHandler())

        if (!options.disableClick) {
          cleanups.push(initClickHandler())
          cleanups.push(initGenerateClickHandler())
          cleanups.push(initWorkClickHandler())
        }

        if (!options.disableExposure) cleanups.push(initExposureHandler())
      }
    },

    onEvent() { },

    cleanup() {
      cleanups.forEach((fn) => {
        try {
          fn()
        } catch (error) {
          console.error('[track-sdk][behavior] 清理处理器失败:', error)
        }
      })

      // 清空清理函数，避免重复调用
      cleanups.length = 0
    },
  }
}
