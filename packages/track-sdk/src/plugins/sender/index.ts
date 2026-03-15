// packages/track-sdk/src/plugins/sender/index.ts

import type { TrackerPlugin, TrackerEvent, CoreContext } from '../../core/types'

export interface SenderOptions {
  url: string
  batchLimit?: number
  timeLimit?: number
}

// 定义缓存数据的结构
interface FailedRequest {
  timestamp: number
  events: TrackerEvent[]
}

export class SenderPlugin implements TrackerPlugin {
  readonly name = 'SenderPlugin'

  private queue: TrackerEvent[] = []
  private timer: any = null
  private options: Required<SenderOptions>
  private readonly STORAGE_KEY = 'track_sdk_failed_queue'

  constructor(options: SenderOptions) {
    this.options = {
      batchLimit: 10,
      timeLimit: 5000, // 默认 5 秒合并一次
      ...options,
    }
  }

  setup(context: CoreContext) {
    // 初始化时，恢复离线数据
    this.retryFromStorage()

    // 监听页面关闭（卸载时强制上报）
    const handleUnload = () => this.flush(true) // true 表示这是卸载阶段
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleUnload()
    })
    window.addEventListener('pagehide', handleUnload)

    // 监听网络恢复，自动重发
    window.addEventListener('online', () => {
      console.log('[SDK] 网络恢复，准备重发离线数据...')
      this.retryFromStorage()
    })
  }

  onEvent(event: TrackerEvent, context: CoreContext) {
    const eventWithContext = { ...event, ...context }

    // 错误事件优先级最高，不进合并队列，立刻发送
    if (event.type.startsWith('error_')) {
      this.sendData([eventWithContext])
    } else {
      this.enqueue(eventWithContext)
    }
  }

  private enqueue(event: TrackerEvent) {
    this.queue.push(event)
    // 达到阈值，触发发送
    if (this.queue.length >= this.options.batchLimit) {
      this.flush()
    } else {
      // 启动定时器兜底
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.options.timeLimit)
      }
    }
  }

  /**
   * 刷新队列
   * @param isUnload 是否为页面卸载阶段（卸载阶段必须同步执行，不能用 requestIdleCallback）
   */
  private flush(isUnload = false) {
    if (this.queue.length === 0) return

    const dataToSend = [...this.queue]
    this.queue = [] // 迅速清空原队列，不阻塞后续数据接入

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (isUnload) {
      // 卸载阶段：直接同步执行，确保不丢失
      this.sendData(dataToSend)
    } else {
      // 普通阶段：利用浏览器空闲时间执行打包发送，绝不抢占主线程渲染帧
      const runOnIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 0))
      runOnIdle(() => this.sendData(dataToSend))
    }
  }

  private sendData(events: TrackerEvent[]) {
    // 网络状态嗅探：如果明确断网，直接存本地，省去无用的 fetch 开销
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.saveToStorage(events)
      return
    }

    const dataStr = JSON.stringify(events)

    // 优先尝试 sendBeacon (专为页面卸载设计的非阻塞请求)
    if (navigator.sendBeacon) {
      // 注意：sendBeacon 有 64KB 大小限制，如果超限可能会返回 false
      const result = navigator.sendBeacon(
        this.options.url,
        new Blob([dataStr], { type: 'application/json' })
      )
      if (result) return
    }

    // 降级使用 fetch (keepalive 保证页面跳转时请求不断)
    fetch(this.options.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dataStr,
      keepalive: true,
    }).catch(() => {
      // 发送失败（服务器挂了或网络突然抖动），兜底保存
      this.saveToStorage(events)
    })
  }

  private saveToStorage(events: TrackerEvent[]) {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      let failedRequests: FailedRequest[] = raw ? JSON.parse(raw) : []

      failedRequests.push({ timestamp: Date.now(), events: events })

      // 限制缓存大小，防止把用户的 LocalStorage 撑爆 (最大 50 批次)
      if (failedRequests.length > 50) failedRequests = failedRequests.slice(-50)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(failedRequests))
      console.warn(`[SDK] 网络异常，已将 ${events.length} 条数据保存到离线队列`)
    } catch (e) {
      console.error('[SDK] 离线存储写入失败', e)
    }
  }

  private retryFromStorage() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY)
      if (!raw) return

      const failedRequests: FailedRequest[] = JSON.parse(raw)
      if (failedRequests.length === 0) return

      // 把所有离线批次拍平，合并成一个大数组重发
      const allEvents = failedRequests.flatMap((req) => req.events)

      // 先清空，避免因为本身 payload 导致无限失败死循环
      localStorage.removeItem(this.STORAGE_KEY)

      // 重新发车
      this.sendData(allEvents)
    } catch (e) {
      console.error('[SDK] 恢复离线数据失败', e)
    }
  }
}
