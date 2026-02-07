import { useState, useEffect, useRef } from 'react'

export const useTypewriter = (text: string | undefined, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('')
  const indexRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    // 如果没有文本，重置
    if (!text) {
      setDisplayedText('')
      indexRef.current = 0
      return
    }

    // 如果文本完全变了，也重置
    setDisplayedText('')
    indexRef.current = 0

    // 开始打字定时器
    timerRef.current = window.setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current))
        indexRef.current++
      } else {
        // 打字结束，清除定时器
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }, speed)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [text, speed])

  return displayedText
}
