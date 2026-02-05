// packages/track-sdk/src/plugins/sender/index.ts

import type { TrackerPlugin, TrackerEvent, CoreContext } from "../../core/types";

export interface SenderOptions {
  url: string;
  batchLimit?: number;
  timeLimit?: number;
}

// 定义缓存数据的结构
interface FailedRequest {
  timestamp: number;
  events: TrackerEvent[];
}

export class SenderPlugin implements TrackerPlugin {
  readonly name = 'SenderPlugin';
  
  private queue: TrackerEvent[] = [];
  private timer: any = null;
  private options: Required<SenderOptions>;
  private readonly STORAGE_KEY = 'track_sdk_failed_queue';

  constructor(options: SenderOptions) {
    this.options = {
      batchLimit: 10,
      timeLimit: 5000,
      ...options
    };
  }

  setup(context: CoreContext) {
    // 初始化时，先看看有没有上次没发出去的“烂账”
    this.retryFromStorage();

    //  监听页面关闭
    const handleUnload = () => this.flush();
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleUnload();
    });
    // 兼容部分旧浏览器
    window.addEventListener('pagehide', handleUnload);
  }

  onEvent(event: TrackerEvent, context: CoreContext) {
    const eventWithContext = { ...event, ...context };

    // 错误事件立即发送
    if (event.type.startsWith('error_')) {
      this.sendData([eventWithContext]);
    } else {
      this.enqueue(eventWithContext);
    }
  }

  private enqueue(event: TrackerEvent) {
    this.queue.push(event);
    if (this.queue.length >= this.options.batchLimit) {
      this.flush();
    } else {
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.options.timeLimit);
      }
    }
  }

  private flush() {
    if (this.queue.length === 0) return;
    const dataToSend = [...this.queue];
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.sendData(dataToSend);
  }

  private sendData(events: TrackerEvent[]) {
    const dataStr = JSON.stringify(events);
    
    // 优先尝试 sendBeacon
    if (navigator.sendBeacon) {
      // 注意：sendBeacon 无法判断 HTTP 状态码（比如 500 错误它也会认为发送成功）
      // 所以 sendBeacon 主要依靠浏览器的可靠性。
      // 如果数据量过大导致 sendBeacon 返回 false，则降级。
      const result = navigator.sendBeacon(this.options.url, new Blob([dataStr], { type: 'application/json' }));
      if (result) return; 
    }

    // 降级使用 fetch
    fetch(this.options.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dataStr,
      keepalive: true,
    }).catch(() => {
      // 发送失败（断网或服务器挂了），启动兜底策略
      this.saveToStorage(events);
    });
  }

  // ---  核心新增：离线存储逻辑 ---

  private saveToStorage(events: TrackerEvent[]) {
    try {
      // 1. 读取已有缓存
      const raw = localStorage.getItem(this.STORAGE_KEY);
      let failedRequests: FailedRequest[] = raw ? JSON.parse(raw) : [];

      // 2. 追加新失败的数据
      failedRequests.push({
        timestamp: Date.now(),
        events: events
      });

      // 3. 限制缓存大小（防止把 LocalStorage 撑爆）
      // 只保留最近 50 条请求
      if (failedRequests.length > 50) {
        failedRequests = failedRequests.slice(-50);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(failedRequests));
      console.warn(`[SDK] 网络异常，${events.length} 条数据已保存到本地`);
    } catch (e) {
      console.error('[SDK] 本地存储失败', e);
    }
  }

  private retryFromStorage() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;

    try {
      const failedRequests: FailedRequest[] = JSON.parse(raw);
      if (failedRequests.length === 0) return;

      console.log(`[SDK] 发现 ${failedRequests.length} 条离线数据，正在重试...`);

      // 简单粗暴策略：取出所有数据，合并成一个大数组尝试重发
      // (也可以分批重发，这里为了演示逻辑简化处理)
      const allEvents = failedRequests.flatMap(req => req.events);
      
      // 清空本地存储，避免死循环（如果这次又失败，会再次被 saveToStorage 捕获）
      localStorage.removeItem(this.STORAGE_KEY);

      // 重新走发送流程
      this.sendData(allEvents);
    } catch (e) {
      console.error('[SDK] 重试离线数据失败', e);
    }
  }
}