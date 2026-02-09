import React, { useEffect, useState, useRef } from 'react'
import {
  createTracker,
  createBehaviorPlugin,
  createErrorPlugin,
  createPerformancePlugin,
} from '../../../../track-sdk/src'

interface TrackingData {
  key: string
  type: string
  timestamp: number
  platform: string
  details: string
}

interface UserTrackingProps {}

const UserTracking: React.FC<UserTrackingProps> = () => {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [activePlatform, setActivePlatform] = useState<string>('web')
  const [isTracking, setIsTracking] = useState<boolean>(false)
  const trackerRef = useRef<any>(null)
  const dataRef = useRef<TrackingData[]>([])

  const initTracker = () => {
    if (!trackerRef.current) {
      // 先创建 tracker 实例
      trackerRef.current = createTracker()

      // 然后将 tracker 实例传递给各个插件
      trackerRef.current.use(createBehaviorPlugin({ tracker: trackerRef.current }))
      trackerRef.current.use(createErrorPlugin({ tracker: trackerRef.current }))
      trackerRef.current.use(createPerformancePlugin({ tracker: trackerRef.current }))
    }
  }

  const startTracking = () => {
    initTracker()
    setIsTracking(true)

    // 模拟平台检测
    const platform = detectPlatform()
    setActivePlatform(platform)

    // 发送初始事件
    trackerRef.current.track('tracking_started', {
      platform,
      userAgent: navigator.userAgent,
    })

    addTrackingData('tracking_started', platform, 'User started tracking')
  }

  const stopTracking = () => {
    if (trackerRef.current) {
      trackerRef.current.track('tracking_stopped', {
        platform: activePlatform,
      })
      addTrackingData('tracking_stopped', activePlatform, 'User stopped tracking')
    }
    setIsTracking(false)
  }

  const detectPlatform = (): string => {
    if (typeof (window as any).wx !== 'undefined' && (window as any).wx.miniProgram) {
      return 'mini-program'
    } else if (typeof window === 'undefined') {
      return 'nodejs'
    } else if (
      typeof (window as any).process === 'object' &&
      (window as any).process.type === 'renderer'
    ) {
      return 'electron'
    } else {
      return 'web'
    }
  }

  const addTrackingData = (type: string, platform: string, details: string) => {
    const newData: TrackingData = {
      key: Date.now().toString(),
      type,
      timestamp: Date.now(),
      platform,
      details,
    }

    dataRef.current = [newData, ...dataRef.current].slice(0, 50)
    setTrackingData([...dataRef.current])
  }

  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking()
      }
    }
  }, [isTracking])

  return (
    <div>
      <div className="pageContent">
        <h2 className="pageTitle">用户行为追踪</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          用户行为追踪页面，用于追踪和分析用户在不同平台上的行为数据。
        </p>
        <div>
          <div style={{ marginBottom: '24px' }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                backgroundColor: isTracking ? '#fff' : '#1890ff',
                color: isTracking ? '#333' : '#fff',
                cursor: 'pointer',
                marginRight: '8px',
              }}
              onClick={isTracking ? stopTracking : startTracking}
            >
              {isTracking ? '停止追踪' : '开始追踪'}
            </button>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff',
                color: '#333',
                cursor: !isTracking ? 'not-allowed' : 'pointer',
                opacity: !isTracking ? 0.5 : 1,
              }}
              onClick={() => setTrackingData([])}
              disabled={!isTracking}
            >
              清空数据
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>当前平台</h4>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
                {activePlatform === 'web'
                  ? '网页'
                  : activePlatform === 'mini-program'
                    ? '小程序'
                    : activePlatform === 'nodejs'
                      ? 'Node.js'
                      : 'Electron'}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>平台</p>
            </div>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>事件数量</h4>
              <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
                {trackingData.length}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>事件</p>
            </div>
            <div
              style={{
                backgroundColor: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
              }}
            >
              <h4 style={{ margin: '0 0 8px 0' }}>追踪状态</h4>
              <p
                style={{
                  margin: '0',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: isTracking ? '#52c41a' : '#faad14',
                }}
              >
                {isTracking ? '活跃' : '非活跃'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e8e8e8',
                marginBottom: '16px',
              }}
            >
              {['web', 'mini-program', 'nodejs', 'electron'].map((platform) => (
                <button
                  key={platform}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderBottom: activePlatform === platform ? '2px solid #1890ff' : 'none',
                    color: activePlatform === platform ? '#1890ff' : '#333',
                  }}
                  onClick={() => setActivePlatform(platform)}
                >
                  {platform === 'web'
                    ? '网页'
                    : platform === 'mini-program'
                      ? '小程序'
                      : platform === 'nodejs'
                        ? 'Node.js'
                        : 'Electron'}
                </button>
              ))}
            </div>

            {activePlatform === 'web' && (
              <WebTracking
                isTracking={isTracking}
                addData={addTrackingData}
                trackerRef={trackerRef}
              />
            )}
            {activePlatform === 'mini-program' && (
              <MiniProgramTracking
                isTracking={isTracking}
                addData={addTrackingData}
                trackerRef={trackerRef}
              />
            )}
            {activePlatform === 'nodejs' && (
              <NodeJSTracking
                isTracking={isTracking}
                addData={addTrackingData}
                trackerRef={trackerRef}
              />
            )}
            {activePlatform === 'electron' && (
              <ElectronTracking
                isTracking={isTracking}
                addData={addTrackingData}
                trackerRef={trackerRef}
              />
            )}
          </div>

          <div>
            <h3 style={{ margin: '0 0 16px 0' }}>追踪事件</h3>
            <div
              style={{
                overflowX: 'auto',
                maxHeight: '400px',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#fafafa' }}>
                  <tr>
                    <th
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e8e8e8',
                        textAlign: 'left',
                      }}
                    >
                      类型
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e8e8e8',
                        textAlign: 'left',
                      }}
                    >
                      时间戳
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e8e8e8',
                        textAlign: 'left',
                      }}
                    >
                      平台
                    </th>
                    <th
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e8e8e8',
                        textAlign: 'left',
                      }}
                    >
                      详情
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trackingData.map((item) => (
                    <tr key={item.key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#e6f7ff',
                            color: '#1890ff',
                            fontSize: '12px',
                          }}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f6ffed',
                            color: '#52c41a',
                            fontSize: '12px',
                          }}
                        >
                          {item.platform === 'web'
                            ? '网页'
                            : item.platform === 'mini-program'
                              ? '小程序'
                              : item.platform === 'nodejs'
                                ? 'Node.js'
                                : 'Electron'}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>{item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Platform-specific tracking components
const WebTracking: React.FC<{
  isTracking: boolean
  addData: (type: string, platform: string, details: string) => void
  trackerRef: React.MutableRefObject<any>
}> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

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

    const handlePageView = () => {
      if (trackerRef.current) {
        trackerRef.current.track('page_view', {
          url: window.location.href,
          referrer: document.referrer,
        })
      }

      addData('page_view', 'web', `页面浏览: ${window.location.pathname}`)
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)

      if (scrollPercentage % 25 === 0) {
        if (trackerRef.current) {
          trackerRef.current.track('scroll', {
            scrollTop,
            scrollPercentage,
          })
        }

        addData('scroll', 'web', `滚动到 ${scrollPercentage}%`)
      }
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handlePageView()

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

const MiniProgramTracking: React.FC<{
  isTracking: boolean
  addData: (type: string, platform: string, details: string) => void
  trackerRef: React.MutableRefObject<any>
}> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

    // 模拟小程序事件
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

const NodeJSTracking: React.FC<{
  isTracking: boolean
  addData: (type: string, platform: string, details: string) => void
  trackerRef: React.MutableRefObject<any>
}> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

    // 模拟 Node.js 事件
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

const ElectronTracking: React.FC<{
  isTracking: boolean
  addData: (type: string, platform: string, details: string) => void
  trackerRef: React.MutableRefObject<any>
}> = ({ isTracking, addData, trackerRef }) => {
  useEffect(() => {
    if (!isTracking) return

    // 模拟 Electron 事件
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

export default UserTracking
