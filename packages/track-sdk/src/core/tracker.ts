// SDK 全局配置 & 上下文类型
export interface TrackerConfig {
  appName: string;
  appVersion?: string;
  devicePlatform?: string;
  env?: string;
  autoPageView?: boolean;
  autoClick?: boolean;
  autoPerformance?: boolean;
  autoError?: boolean;
}

export interface TrackerUserInfo {
  user_id: string;
  user_type?: string;
}

// 通用上下文参数（供内部复用）
export interface CommonContext {
  app_name?: string;
  app_version?: string;
  device_platform?: string;
  env?: string;
  user_id?: string;
  user_type?: string;
  page_name?: string;
  page_url?: string;
  origin?: string;
  origins?: string[];
  timestamp?: number;
}

// 内部当前状态（简单写法）
let currentConfig: TrackerConfig | null = null;
let currentUser: TrackerUserInfo | null = null;
let currentOrigin: string | undefined;
let originChain: string[] = [];

/**
 * 初始化埋点 SDK
 */
export function initTracker(config: TrackerConfig): void {
  currentConfig = config;
}

/**
 * 设置当前用户信息（登录 / 切账号时调用）
 */
export function setUser(user: TrackerUserInfo): void {
  currentUser = user;
}

/**
 * 清除当前用户信息（退出登录时调用）
 */
export function clearUser(): void {
  currentUser = null;
}

/**
 * 设置当前点位 origin，并维护 origins 链路
 */
export function setOrigin(originCode: string): void {
  currentOrigin = originCode;
  originChain.push(originCode);
  // 简单裁剪，防止链路过长
  const MAX_ORIGINS = 10;
  if (originChain.length > MAX_ORIGINS) {
    originChain = originChain.slice(-MAX_ORIGINS);
  }
}

/**
 * 获取当前通用上下文（给内部模块用）
 */
export function getCommonContext(): CommonContext {
  return {
    app_name: currentConfig?.appName,
    app_version: currentConfig?.appVersion,
    device_platform: currentConfig?.devicePlatform,
    env: currentConfig?.env,
    user_id: currentUser?.user_id,
    user_type: currentUser?.user_type,
    origin: currentOrigin,
    origins: originChain.slice(),
    timestamp: Date.now(),
  };
}

/**
 * 统一 track 底层占位函数
 * 后续由 Pipeline 模块接管真正的上报逻辑
 */
export function trackEvent(eventName: string, payload: Record<string, any>): void {
  const context = getCommonContext();
  const event = {
    event_name: eventName,
    ...context,
    ...payload,
  };
  // TODO: 接入真正的上报通道（fetch / sendBeacon 等）
  // 这里暂时只做占位
  // eslint-disable-next-line no-console
  console.log('[tracking-sdk] trackEvent', event);
}