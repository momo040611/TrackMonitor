export interface TrackerEvent {
  type: string
  payload?: unknown
  timestamp: number
}

export interface CoreContext {
  // 预留：例如 userId、sessionId、device、env 等
  [key: string]: unknown
}

export interface TrackerPlugin {
  name: string
  setup?(context: CoreContext): void
  onEvent?(event: TrackerEvent, context: CoreContext): void
  cleanup?(): void
}
