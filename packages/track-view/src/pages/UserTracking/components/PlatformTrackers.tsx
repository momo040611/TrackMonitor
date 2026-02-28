import React, { useEffect } from 'react'

export interface TrackerProps {
  isTracking: boolean
  addData: (type: string, platform: string, details: string) => void
  trackerRef: React.MutableRefObject<any>
}

// Web 网页端追踪组件
export const WebTracking: React.FC<TrackerProps> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

    // 监听点击事件
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const tagName = target.tagName
      const className = target.className

      if (trackerRef.current) {
        trackerRef.current.track('click', {
          tagName,
          className,
          x: e.clientX,
          y: e.clientY,
        })
      }

      addData('click', 'web', `点击了 ${tagName} 元素`)
    }

    // 监听页面浏览事件
    const handlePageView = () => {
      if (trackerRef.current) {
        trackerRef.current.track('page_view', {
          url: window.location.href,
          referrer: document.referrer,
        })
      }

      addData('page_view', 'web', `页面浏览: ${window.location.pathname}`)
    }

    // 监听滚动事件
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)

      if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
        if (trackerRef.current) {
          trackerRef.current.track('scroll', {
            scrollTop,
            scrollPercentage,
          })
        }

        addData('scroll', 'web', `滚动到 ${scrollPercentage}%`)
      }
    }

    // 绑定事件
    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handlePageView()

    // 卸载时清理事件
    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isTracking, addData, trackerRef])

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <h4>网页平台追踪</h4>
      <p>追踪网页平台上的用户交互：</p>
      <ul>
        <li>点击事件</li>
        <li>页面浏览</li>
        <li>滚动事件</li>
        <li>错误事件</li>
        <li>性能指标</li>
      </ul>
    </div>
  )
}

// 小程序端追踪组件 (模拟)
export const MiniProgramTracking: React.FC<TrackerProps> = ({
  isTracking,
  addData,
  trackerRef,
}) => {
  useEffect(() => {
    if (!isTracking) return

    // 模拟小程序事件轮询
    const interval = setInterval(() => {
      const events = ['page_show', 'tap', 'swipe', 'scroll', 'error']
      const randomEvent = events[Math.floor(Math.random() * events.length)]

      if (trackerRef.current) {
        trackerRef.current.track(randomEvent, {
          page: 'index',
          component: 'button',
        })
      }

      addData(randomEvent, 'mini-program', `小程序 ${randomEvent} 事件`)
    }, 5000)

    return () => clearInterval(interval)
  }, [isTracking, addData, trackerRef])

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <h4>小程序平台追踪</h4>
      <p>追踪小程序中的用户交互：</p>
      <ul>
        <li>页面显示/隐藏事件</li>
        <li>点击事件</li>
        <li>滑动事件</li>
        <li>滚动事件</li>
        <li>错误事件</li>
      </ul>
    </div>
  )
}

// Node.js 服务端追踪组件 (模拟)
export const NodeJSTracking: React.FC<TrackerProps> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

    // 模拟 Node.js 事件轮询
    const interval = setInterval(() => {
      const events = ['request', 'response', 'error', 'warning', 'info']
      const randomEvent = events[Math.floor(Math.random() * events.length)]

      if (trackerRef.current) {
        trackerRef.current.track(randomEvent, {
          endpoint: '/api/data',
          method: 'GET',
        })
      }

      addData(randomEvent, 'nodejs', `Node.js ${randomEvent} 事件`)
    }, 4000)

    return () => clearInterval(interval)
  }, [isTracking, addData, trackerRef])

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <h4>Node.js 平台追踪</h4>
      <p>追踪 Node.js 中的服务器端事件：</p>
      <ul>
        <li>HTTP 请求/响应</li>
        <li>错误事件</li>
        <li>警告事件</li>
        <li>信息事件</li>
        <li>性能指标</li>
      </ul>
    </div>
  )
}

// Electron 桌面端追踪组件 (模拟)
export const ElectronTracking: React.FC<TrackerProps> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

    // 模拟 Electron 事件轮询
    const interval = setInterval(() => {
      const events = ['window_focus', 'window_blur', 'menu_click', 'key_press', 'error']
      const randomEvent = events[Math.floor(Math.random() * events.length)]

      if (trackerRef.current) {
        trackerRef.current.track(randomEvent, {
          windowId: 1,
          action: 'click',
        })
      }

      addData(randomEvent, 'electron', `Electron ${randomEvent} 事件`)
    }, 6000)

    return () => clearInterval(interval)
  }, [isTracking, addData, trackerRef])

  return (
    <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <h4>Electron 平台追踪</h4>
      <p>追踪 Electron 桌面应用中的事件：</p>
      <ul>
        <li>窗口聚焦/失焦事件</li>
        <li>菜单点击事件</li>
        <li>按键事件</li>
        <li>错误事件</li>
        <li>性能指标</li>
      </ul>
    </div>
  )
}
