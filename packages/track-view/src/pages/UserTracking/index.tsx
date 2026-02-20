import React, { useEffect, useState, useRef } from 'react'
import { Card, Button, Table, Statistic, Row, Col, message, Spin } from 'antd'
import {
  UserOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import { api } from '../../api/request'

// 导入追踪 SDK 相关功能
// 注意：这里暂时注释掉，因为 track-sdk 可能不存在
// import {
//   createTracker,
//   createBehaviorPlugin,
//   createErrorPlugin,
//   createPerformancePlugin,
// } from '../../../../track-sdk/src'

// 类型定义
interface TrackingData {
  key: string
  type: string
  timestamp: number
  platform: string
  details: string
}

interface UserTrackingProps {}

const UserTracking: React.FC<UserTrackingProps> = () => {
  // 基础状态
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [activePlatform, setActivePlatform] = useState<string>('web')
  const [isTracking, setIsTracking] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 引用
  const trackerRef = useRef<any>(null)
  const dataRef = useRef<TrackingData[]>([])

  // 模拟 tracker 实例
  const initTracker = () => {
    if (!trackerRef.current) {
      // 模拟 tracker 实例
      trackerRef.current = {
        track: (event: string, data: any) => {},
        use: (plugin: any) => {},
      }
    }
  }

  // 开始追踪
  const startTracking = async () => {
    setIsLoading(true)
    try {
      initTracker()
      setIsTracking(true)

      // 模拟平台检测
      const platform = detectPlatform()
      setActivePlatform(platform)

      // 发送初始事件
      if (trackerRef.current) {
        trackerRef.current.track('tracking_started', {
          platform,
          userAgent: navigator.userAgent,
        })

        addTrackingData('tracking_started', platform, 'User started tracking')
      }

      // 从后端获取初始数据
      await fetchTrackingData()

      // 开始定期获取数据
      startDataPolling()
    } catch (error) {
      message.error('开始追踪失败')
      setIsTracking(false)
    } finally {
      setIsLoading(false)
    }
  }

  // 停止追踪
  const stopTracking = () => {
    if (trackerRef.current) {
      trackerRef.current.track('tracking_stopped', {
        platform: activePlatform,
      })
      addTrackingData('tracking_stopped', activePlatform, 'User stopped tracking')
    }
    setIsTracking(false)
    stopDataPolling()
  }

  // 检测平台
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

  // 添加追踪数据
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

  // 从后端获取追踪数据
  const fetchTrackingData = async () => {
    try {
      const result = await api.getUserBehaviorData({
        projectId: 'default',
        timeRange: '24h',
      })

      if (result.data && result.data.code === 200 && result.data.data) {
        // 处理后端返回的数据
        const backendData = result.data.data
        if (Array.isArray(backendData)) {
          const formattedData = backendData.map((item: any, index: number) => ({
            key: item.id || `event-${index}-${Date.now()}`,
            type: item.type || 'unknown',
            timestamp: item.timestamp || Date.now(),
            platform: item.platform || activePlatform,
            details: item.details || JSON.stringify(item),
          }))

          dataRef.current = formattedData.slice(0, 50)
          setTrackingData([...dataRef.current])
        }
      }
    } catch (error) {
      message.error('获取追踪数据失败')
    }
  }

  // 数据轮询相关
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 开始数据轮询
  const startDataPolling = () => {
    // 每 5 秒从后端获取一次数据
    pollingIntervalRef.current = setInterval(() => {
      if (isTracking) {
        fetchTrackingData()
      }
    }, 5000)
  }

  // 停止数据轮询
  const stopDataPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  // 清理函数
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking()
      }
      // 确保停止数据轮询
      stopDataPolling()
    }
  }, [isTracking])

  return (
    <div>
      <div className="pageContent">
        <h2 className="pageTitle">用户行为追踪</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          用户行为追踪页面，用于追踪和分析用户在不同平台上的行为数据。
        </p>

        {/* 控制按钮和状态概览 */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="primary"
                  icon={isTracking ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={isTracking ? stopTracking : startTracking}
                >
                  {isTracking ? '停止追踪' : '开始追踪'}
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={() => setTrackingData([])}
                  disabled={!isTracking}
                >
                  清空数据
                </Button>
              </div>
            </Col>
            <Col span={16}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic
                    title="当前平台"
                    value={
                      activePlatform === 'web'
                        ? '网页'
                        : activePlatform === 'mini-program'
                          ? '小程序'
                          : activePlatform === 'nodejs'
                            ? 'Node.js'
                            : 'Electron'
                    }
                  />
                </Col>
                <Col span={6}>
                  <Statistic title="事件数量" value={trackingData.length} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="追踪状态"
                    value={isTracking ? '活跃' : '非活跃'}
                    styles={{ content: { color: isTracking ? '#52c41a' : '#faad14' } }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* 平台选择 */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['web', 'mini-program', 'nodejs', 'electron'].map((platform) => (
              <Button
                key={platform}
                type={activePlatform === platform ? 'primary' : 'default'}
                onClick={() => setActivePlatform(platform)}
              >
                {platform === 'web'
                  ? '网页'
                  : platform === 'mini-program'
                    ? '小程序'
                    : platform === 'nodejs'
                      ? 'Node.js'
                      : 'Electron'}
              </Button>
            ))}
          </div>
        </Card>

        {/* 追踪详情 */}
        <Spin spinning={isLoading}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="平台追踪详情">
                {activePlatform === 'web' && (
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
                )}
                {activePlatform === 'mini-program' && (
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
                )}
                {activePlatform === 'nodejs' && (
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
                )}
                {activePlatform === 'electron' && (
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
                )}
              </Card>
            </Col>
            <Col span={24}>
              <Card title="追踪事件" styles={{ body: { maxHeight: '400px', overflowY: 'auto' } }}>
                <Table
                  dataSource={trackingData}
                  columns={[
                    {
                      title: '类型',
                      dataIndex: 'type',
                      key: 'type',
                      render: (text) => (
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
                          {text}
                        </span>
                      ),
                    },
                    {
                      title: '时间戳',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (text) => new Date(text).toLocaleString(),
                    },
                    {
                      title: '平台',
                      dataIndex: 'platform',
                      key: 'platform',
                      render: (text) => (
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
                          {text === 'web'
                            ? '网页'
                            : text === 'mini-program'
                              ? '小程序'
                              : text === 'nodejs'
                                ? 'Node.js'
                                : 'Electron'}
                        </span>
                      ),
                    },
                    {
                      title: '详情',
                      dataIndex: 'details',
                      key: 'details',
                    },
                  ]}
                  rowKey="key"
                />
              </Card>
            </Col>
          </Row>
        </Spin>
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
