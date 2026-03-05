/**
 * SmartHall Tab 键值常量
 * 集中管理所有 Tab 键值，避免魔法字符串问题
 */
export const SmartHallTabKey = {
  TRACKING_COPILOT: '1',
  ANOMALY_DIAGNOSIS: '2',
  LOG_PARSER: '3',
  ROOT_CAUSE_ANALYSIS: '4',
  SMART_DISPATCH: '5',
} as const

/**
 * Tab 键值类型
 * 从常量对象推断出的联合类型
 */
export type SmartHallTabKeyType = (typeof SmartHallTabKey)[keyof typeof SmartHallTabKey]
