import { createContext } from 'react'
import type { SmartHallTabKeyType } from '../constants'

/**
 * SmartHall 全局状态类型
 */
interface SmartHallState {
  // 分派任务内容
  dispatchTask: string
  // 日志上下文
  logContext: string
  // 当前激活的 Tab
  activeTab: SmartHallTabKeyType
}

/**
 * SmartHall 上下文值类型
 */
interface SmartHallContextValue extends SmartHallState {
  // 设置分派任务
  setDispatchTask: (task: string) => void
  // 设置日志上下文
  setLogContext: (log: string) => void
  // 设置激活的 Tab
  setActiveTab: (tab: SmartHallTabKeyType) => void
  // 跳转到分派页面
  goToDispatch: (content: string) => void
  // 跳转到日志解析页面
  goToLogParser: (log: string) => void
}

// 创建上下文
export const SmartHallContext = createContext<SmartHallContextValue | undefined>(undefined)
