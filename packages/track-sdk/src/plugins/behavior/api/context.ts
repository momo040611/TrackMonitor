/**
 * 通用上下文参数
 */
export interface CommonContext {
  app_name?: string // 应用名称（来自 TrackerConfig.appName）
  app_version?: string // 应用版本号
  device_platform?: string // 平台，如 'web'
  env?: string // 环境，如 'prod'

  user_id?: string // 当前用户 ID
  user_type?: string // 用户类型

  page_name?: string // 当前页面名称（可由行为模块或业务设置）
  page_url?: string // 当前 URL/路由

  origin?: string // 当前点位编码
  origins?: string[] // 点位链路（origin 的历史数组）

  timestamp?: number // 前端事件时间戳（毫秒）
}
