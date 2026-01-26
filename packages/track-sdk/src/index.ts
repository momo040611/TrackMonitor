// Public entry of tracking SDK
// 业务侧只需要从这里引入

export * from './core/tracker';
export * from './core/behavior';
export * from './core/performance';
export * from './core/error';

// 类型聚合导出
export type { BehaviorEventNames, BehaviorEventMap } from './core/behavior';
export type { PerformanceEventNames, PerformanceEventMap } from './core/performance';
export type { ErrorEventNames, ErrorEventMap } from './core/error';