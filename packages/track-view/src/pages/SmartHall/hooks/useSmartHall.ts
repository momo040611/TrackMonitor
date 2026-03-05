import { useContext } from 'react'
import { SmartHallContext } from '../context/SmartHallContext'

// 自定义 hook 使用上下文
export const useSmartHall = () => {
  const context = useContext(SmartHallContext)
  if (context === undefined) {
    throw new Error('useSmartHall must be used within a SmartHallProvider')
  }
  return context
}
