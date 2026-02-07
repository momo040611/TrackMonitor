export interface TrackerEvent {
  type: string
  payload?: unknown
  timestamp: number
}

export interface CoreContext {
  /** 应用 ID，用于区分不同接入方 */
  appId?: string

  /** 当前登录用户 ID */
  userId?: string

  /** 会话 ID（例如用于关联一次访问会话） */
  sessionId?: string

  /** 设备信息，例如 UA 解析结果或自定义设备标识 */
  device?: unknown

  /** 运行环境，例如 prod / test / dev 等 */
  env?: string

  /**
   * Tracker 实例引用
   * - 行为插件等可以通过它直接调用 track
   */
  tracker?: {
    track(type: string, payload?: unknown): void
  }

  /**
   * 事件发送函数
   * - 性能插件等可以通过它将规范化事件交回核心管线
   */
  send?(event: TrackerEvent): void

  // 其余业务自定义字段
  [key: string]: unknown
}

export interface TrackerPlugin {
  name: string
  setup?(context: CoreContext): void
  onEvent?(event: TrackerEvent, context: CoreContext): void
  cleanup?(): void
}
