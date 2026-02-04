import { trackBehavior } from '../utils/trackBehavior'
import type { WorkShowEvent } from '../types'

// 配置常量
const CONFIG = {
  threshold: 0.5, // 可见面积 >= 50%
  duration: 500, // 停留时长 >= 500ms
  attrSelector: '[data-track-exposure="true"]', // 监听的 DOM 属性
}

// 状态管理
const reportedIds = new Set<string>() // 去重集合
const timerMap = new WeakMap<Element, number>() // 计时器映射
let intersectionObserver: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null

/**
 * 解析 DOM 元素上的埋点数据
 */
function parseElementData(el: Element): WorkShowEvent | null {
  const workId = el.getAttribute('data-work-id')
  if (!workId) return null

  return {
    work_id: workId,
    list_id: el.getAttribute('data-list-id') || undefined,
    index: Number(el.getAttribute('data-index')) || undefined,
    page_name: document.title,
  }
}

/**
 * 触发曝光上报
 */
function reportExposure(target: Element) {
  const data = parseElementData(target)
  if (!data) return

  // 再次检查去重（防止定时器期间被重置后重复上报）
  if (reportedIds.has(data.work_id)) return

  // 标记为已上报
  reportedIds.add(data.work_id)

  // 发送埋点
  trackBehavior('work_show', data)

  // 清理计时器引用
  timerMap.delete(target)
}

/**
 * IntersectionObserver 回调
 */
function handleIntersect(entries: IntersectionObserverEntry[]) {
  entries.forEach((entry) => {
    const target = entry.target
    const workId = target.getAttribute('data-work-id')

    // 如果已经上报过，直接忽略
    if (workId && reportedIds.has(workId)) {
      return
    }

    if (entry.isIntersecting) {
      // 进入视口：开始计时
      if (!timerMap.has(target)) {
        const timer = window.setTimeout(() => {
          reportExposure(target)
        }, CONFIG.duration)
        timerMap.set(target, timer)
      }
    } else {
      // 离开视口：清除计时
      const timer = timerMap.get(target)
      if (timer) {
        clearTimeout(timer)
        timerMap.delete(target)
      }
    }
  })
}

/**
 * 重置曝光状态 (用于下拉刷新、路由切换)
 */
export function resetExposure() {
  reportedIds.clear()
}

/**
 * 初始化自动曝光监听
 */
export function initExposureHandler(): () => void {
  // 初始化 IntersectionObserver
  intersectionObserver = new IntersectionObserver(handleIntersect, {
    threshold: CONFIG.threshold,
  })

  //  初始化 MutationObserver (自动监听新插入的 DOM，如无限滚动)
  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          // 检查节点本身
          if (node.matches(CONFIG.attrSelector)) {
            intersectionObserver?.observe(node)
          }
          // 检查子节点
          const children = node.querySelectorAll(CONFIG.attrSelector)
          children.forEach((child) => intersectionObserver?.observe(child))
        }
      })
    })
  })

  // 开始监听 DOM 变化
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // 初始扫描
  document.querySelectorAll(CONFIG.attrSelector).forEach((el) => {
    intersectionObserver?.observe(el)
  })

  // 3. 监听路由变化自动重置
  const handleRouteChange = () => resetExposure()
  window.addEventListener('popstate', handleRouteChange)

  return () => {
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
    window.removeEventListener('popstate', handleRouteChange)
  }
}
