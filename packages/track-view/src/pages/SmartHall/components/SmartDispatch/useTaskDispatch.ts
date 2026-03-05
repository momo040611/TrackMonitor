import { useState, useEffect, useCallback, useRef } from 'react'
import { message } from 'antd'
import { useSmartHall } from '../../hooks/useSmartHall'

// 评分常量
export const SCORING = {
  BASE_SCORE: 50,
  SKILL_MATCH_BONUS: 40,
  UI_MATCH_BONUS: 45,
  HIGH_LOAD_PENALTY: 10,
  HIGH_LOAD_THRESHOLD: 80,
  MATCH_THRESHOLD_HIGH: 60,
} as const

// 模拟延迟常量
const SIMULATION_DELAY = 1500

// 定义开发者模型
export interface Developer {
  id: string
  name: string
  role: string
  avatar: string
  skills: string[]
  currentLoad: number // 当前负载
  matchScore: number // 本次匹配度
  reason: string // 推荐理由
}

// 模拟开发者池
const MOCK_DEVS: Developer[] = [
  {
    id: 'u1',
    name: 'Jason (前端)',
    role: 'Senior Frontend',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jason',
    skills: ['React', 'TypeScript', 'Visualization'],
    currentLoad: 85,
    matchScore: 0,
    reason: '',
  },
  {
    id: 'u2',
    name: 'Alice (后端)',
    role: 'Backend Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    skills: ['Java', 'Spring', 'Redis'],
    currentLoad: 40,
    matchScore: 0,
    reason: '',
  },
  {
    id: 'u3',
    name: 'David (移动端)',
    role: 'iOS Expert',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    skills: ['Swift', 'Objective-C', 'Crashlytics'],
    currentLoad: 20,
    matchScore: 0,
    reason: '',
  },
]

export const useTaskDispatch = () => {
  const { dispatchTask } = useSmartHall()
  const [loading, setLoading] = useState(false)
  const [taskDesc, setTaskDesc] = useState('')
  const [candidates, setCandidates] = useState<Developer[]>([])
  const [analyzedTags, setAnalyzedTags] = useState<string[]>([])
  const hasShownMessageRef = useRef(false)

  // 监听 Context 中的 dispatchTask 变化
  useEffect(() => {
    if (dispatchTask && dispatchTask !== taskDesc && !hasShownMessageRef.current) {
      const timeoutId = setTimeout(() => {
        setTaskDesc(dispatchTask)
        message.info('已自动导入异常上下文，请点击开始分派')
        hasShownMessageRef.current = true
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [dispatchTask, taskDesc])

  // 模拟 AI 分派逻辑
  const handleDispatch = useCallback(() => {
    if (!taskDesc.trim()) return message.warning('请输入任务描述')

    setLoading(true)
    setCandidates([])
    setAnalyzedTags([])

    setTimeout(() => {
      // 1. 简单的关键词提取模拟
      const tags: string[] = []
      if (taskDesc.toLowerCase().includes('ios') || taskDesc.includes('崩溃'))
        tags.push('Client', 'Crash')
      else if (taskDesc.toLowerCase().includes('java') || taskDesc.includes('超时'))
        tags.push('Server', 'Performance')
      else tags.push('Frontend', 'UI')

      setAnalyzedTags(tags)

      // 2. 模拟打分逻辑
      const scoredDevs = MOCK_DEVS.map((dev) => {
        let score = SCORING.BASE_SCORE
        let reason = '技能栈部分匹配'

        // 简单的规则匹配
        if (tags.includes('Crash') && dev.skills.includes('Swift')) {
          score += SCORING.SKILL_MATCH_BONUS
          reason = '擅长处理客户端崩溃问题'
        } else if (tags.includes('Performance') && dev.skills.includes('Java')) {
          score += SCORING.SKILL_MATCH_BONUS
          reason = '后端性能优化专家'
        } else if (tags.includes('UI') && dev.skills.includes('React')) {
          score += SCORING.UI_MATCH_BONUS
          reason = '负责该 UI 模块'
        }

        // 负载惩罚
        if (dev.currentLoad > SCORING.HIGH_LOAD_THRESHOLD) {
          score -= SCORING.HIGH_LOAD_PENALTY
          reason += ' (但当前负载较高)'
        }

        return { ...dev, matchScore: score, reason }
      }).sort((a, b) => b.matchScore - a.matchScore)

      setCandidates(scoredDevs)
      setLoading(false)
      message.success('智能分派分析完成')
    }, SIMULATION_DELAY)
  }, [taskDesc])

  const handleAssign = useCallback((name: string) => {
    message.success(`任务已自动创建 Jira 工单并指派给 ${name}`)
  }, [])

  return {
    loading,
    taskDesc,
    setTaskDesc,
    candidates,
    analyzedTags,
    handleDispatch,
    handleAssign,
  }
}
