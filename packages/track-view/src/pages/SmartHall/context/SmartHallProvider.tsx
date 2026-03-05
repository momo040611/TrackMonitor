import React, { useState, useCallback } from 'react'
import { SmartHallContext } from './SmartHallContext'
import { SmartHallTabKey, type SmartHallTabKeyType } from '../constants'

// Context Provider
export const SmartHallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dispatchTask, setDispatchTask] = useState('')
  const [logContext, setLogContext] = useState('')
  const [activeTab, setActiveTab] = useState<SmartHallTabKeyType>(SmartHallTabKey.ANOMALY_DIAGNOSIS) // 默认异常诊断

  // 跳转到分派页面
  const goToDispatch = useCallback((content: string) => {
    setDispatchTask(content)
    setActiveTab(SmartHallTabKey.SMART_DISPATCH)
  }, [])

  // 跳转到日志解析页面
  const goToLogParser = useCallback((log: string) => {
    setLogContext(log)
    setActiveTab(SmartHallTabKey.LOG_PARSER)
  }, [])

  const value = {
    dispatchTask,
    logContext,
    activeTab,
    setDispatchTask,
    setLogContext,
    setActiveTab,
    goToDispatch,
    goToLogParser,
  }

  return <SmartHallContext.Provider value={value}>{children}</SmartHallContext.Provider>
}
