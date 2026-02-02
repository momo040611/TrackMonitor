import { trackBehavior } from '../utils/trackBehavior'
import type { WorkClickEvent } from '../types'

/**
 * 初始化作品点击监听
 * 监听带有 data-track-event="work_click" 的元素点击
 */
export function initWorkClickHandler(): () => void {
  const handleClick = (event: MouseEvent) => {
    let target = event.target as HTMLElement
    let trackEl: HTMLElement | null = null

    // 向上查找，直到找到目标元素或 body
    while (target && target !== document.body && target !== document.documentElement) {
      // 检查是否是 work_click 事件
      if (target.getAttribute('data-track-event') === 'work_click') {
        trackEl = target
        break
      }
      target = target.parentElement as HTMLElement
    }

    if (!trackEl) {
      return
    }

    // 提取业务参数 (与 work_show 保持一致)
    const workId = trackEl.getAttribute('data-work-id')
    if (!workId) return

    const listId = trackEl.getAttribute('data-list-id') || undefined
    const indexStr = trackEl.getAttribute('data-index')
    const index = indexStr ? Number(indexStr) : undefined

    // 上报事件
    trackBehavior('work_click', {
      page_name: document.title,
      work_id: workId,
      list_id: listId,
      index: index,
    } as WorkClickEvent)
  }

  // 使用捕获阶段监听
  window.addEventListener('click', handleClick, true)

  return () => {
    window.removeEventListener('click', handleClick, true)
  }
}
