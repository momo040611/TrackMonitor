import { useState, useEffect, useRef } from 'react'

export const useTypewriter = (text: string | undefined, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const textRef = useRef(text)

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // 更新 ref 值
    textRef.current = text

    // 如果没有文本，直接返回
    if (!text) {
      // 使用 setTimeout 延迟重置，避免同步 setState
      const resetTimeout = window.setTimeout(() => {
        setDisplayedText('')
        indexRef.current = 0
      }, 0)
      return () => window.clearTimeout(resetTimeout)
    }

    // 延迟重置状态，避免同步 setState
    const resetTimeout = window.setTimeout(() => {
      setDisplayedText('')
      indexRef.current = 0

      // 延迟启动打字效果
      const timeoutId = window.setTimeout(() => {
        // 开始打字定时器
        timerRef.current = window.setInterval(() => {
          const currentText = textRef.current
          if (!currentText) return

          if (indexRef.current < currentText.length) {
            setDisplayedText((prev) => prev + currentText.charAt(indexRef.current))
            indexRef.current++
          } else {
            // 打字结束，清除定时器
            if (timerRef.current) clearInterval(timerRef.current)
          }
        }, speed)
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }, 0)

    return () => {
      window.clearTimeout(resetTimeout)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [text, speed])

  return displayedText
}
