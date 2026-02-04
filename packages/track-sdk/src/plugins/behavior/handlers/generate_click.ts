import { trackBehavior } from '../utils/trackBehavior'
import type { GenerateClickEvent } from '../types'

/**
 * 初始化生成点击监听
 * 监听带有 data-track-event="generate_click" 的元素点击
 */
export function initGenerateClickHandler(): () => void {
  const handleClick = (event: MouseEvent) => {
    let target = event.target as HTMLElement
    let trackEl: HTMLElement | null = null

    // 向上查找，直到找到目标元素或 body
    while (target && target !== document.body && target !== document.documentElement) {
      // 检查是否是 generate_click 事件
      if (target.getAttribute('data-track-event') === 'generate_click') {
        trackEl = target
        break
      }
      target = target.parentElement as HTMLElement
    }

    if (!trackEl) {
      return
    }

    // 提取业务参数
    const entryPoint = trackEl.getAttribute('data-track-entry-point') || 'unknown'
    const modelType = trackEl.getAttribute('data-track-model-type') || undefined
    const promptLengthStr = trackEl.getAttribute('data-track-prompt-length')
    const promptLength = promptLengthStr ? Number(promptLengthStr) : undefined

    // 上报事件
    trackBehavior('generate_click', {
      page_name: document.title,
      entry_point: entryPoint,
      model_type: modelType,
      prompt_length: promptLength,
    } as GenerateClickEvent)
  }

  // 使用捕获阶段监听
  window.addEventListener('click', handleClick, true)

  return () => {
    window.removeEventListener('click', handleClick, true)
  }
}
