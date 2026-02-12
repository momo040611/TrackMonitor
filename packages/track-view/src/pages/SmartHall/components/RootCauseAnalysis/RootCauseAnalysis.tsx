import React, { useState, useEffect, useRef } from 'react'
import {
  Card,
  Button,
  Typography,
  Tag,
  Space,
  Empty,
  Drawer,
  Timeline,
  Descriptions,
  Progress,
  message,
} from 'antd'
import {
  AimOutlined,
  SearchOutlined,
  DeploymentUnitOutlined,
  WarningOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  RightOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import { AiService } from '../../services/useAiAssistant'
import './RootCauseAnalysis.less'

const { Title, Text } = Typography

interface Props {
  onAnalyzeLog?: (log: string) => void
}

// 数据接口定义
interface RootCauseResult {
  dimension: string
  value: string
  score: number
  description: string
  type?: 'infrastructure' | 'business' | 'client'
}

interface DetailLog {
  id: string
  time: string
  level: 'ERROR' | 'WARN'
  message: string
  stack?: string
}

export const RootCauseAnalysis: React.FC<Props> = ({ onAnalyzeLog }) => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RootCauseResult[]>([])

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedNode, setSelectedNode] = useState<RootCauseResult | null>(null)
  const [detailLogs, setDetailLogs] = useState<DetailLog[]>([])

  // 1. 定义 Refs 来获取 DOM 元素的位置
  const containerRef = useRef<HTMLDivElement>(null)
  const rootNodeRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  // 存储计算好的连线路径
  const [svgPaths, setSvgPaths] = useState<string[]>([])

  const handleDeepAnalysis = (log: DetailLog) => {
    if (!onAnalyzeLog) return

    // 构造一个模拟的 Raw Log 字符串
    const rawLogString = `[${log.time}] [${log.level}] [Thread-main] ${log.message}\n${log.stack || ''}`

    onAnalyzeLog(rawLogString)
    message.loading('正在提取日志上下文...', 0.5)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      // 调用后端接口获取根因分析数据
      const analysisData = await AiService.getAiAnalysisData('root-cause-analysis')

      // 处理返回的数据
      if (analysisData && analysisData.results) {
        setResults(
          analysisData.results.sort((a: RootCauseResult, b: RootCauseResult) => b.score - a.score)
        )
        message.success('根因分析完成')
      } else {
        // 如果没有数据，使用默认数据
        const mockResponse: RootCauseResult[] = [
          {
            dimension: 'app_version',
            value: '2.4.0-beta',
            score: 95,
            type: 'client',
            description: '崩溃率激增，高度聚集于该内测版本',
          },
          {
            dimension: 'db_instance',
            value: 'rm-bp1x9... (主库)',
            score: 88,
            type: 'infrastructure',
            description: 'CPU 使用率持续 99%，导致写入超时',
          },
          {
            dimension: 'api_path',
            value: '/api/v1/user/profile',
            score: 72,
            type: 'business',
            description: '接口 P99 延迟超过 2s',
          },
          {
            dimension: 'api_path',
            value: '/api/v1/order/create',
            score: 68,
            type: 'business',
            description: '下单接口偶发 502 错误',
          },
          {
            dimension: 'region',
            value: '华东-上海',
            score: 45,
            type: 'infrastructure',
            description: '该区域网络抖动（置信度低）',
          },
          {
            dimension: 'os',
            value: 'Android 14',
            score: 42,
            type: 'client',
            description: '特定系统版本兼容性问题',
          },
        ]
        setResults(mockResponse.sort((a, b) => b.score - a.score))
        message.success('根因分析完成 (使用默认数据)')
      }
    } catch (error) {
      message.error('根因分析失败，请稍后重试')
      console.error('根因分析失败:', error)

      // 出错时使用默认数据
      const mockResponse: RootCauseResult[] = [
        {
          dimension: 'app_version',
          value: '2.4.0-beta',
          score: 95,
          type: 'client',
          description: '崩溃率激增，高度聚集于该内测版本',
        },
        {
          dimension: 'db_instance',
          value: 'rm-bp1x9... (主库)',
          score: 88,
          type: 'infrastructure',
          description: 'CPU 使用率持续 99%，导致写入超时',
        },
        {
          dimension: 'api_path',
          value: '/api/v1/user/profile',
          score: 72,
          type: 'business',
          description: '接口 P99 延迟超过 2s',
        },
        {
          dimension: 'api_path',
          value: '/api/v1/order/create',
          score: 68,
          type: 'business',
          description: '下单接口偶发 502 错误',
        },
        {
          dimension: 'region',
          value: '华东-上海',
          score: 45,
          type: 'infrastructure',
          description: '该区域网络抖动（置信度低）',
        },
        {
          dimension: 'os',
          value: 'Android 14',
          score: 42,
          type: 'client',
          description: '特定系统版本兼容性问题',
        },
      ]
      setResults(mockResponse.sort((a, b) => b.score - a.score))
    } finally {
      setLoading(false)
    }
  }

  // 动态计算连线
  useEffect(() => {
    // 确保有数据且 ref 已经挂载
    if (results.length === 0 || !containerRef.current || !rootNodeRef.current) return

    const calculatePaths = () => {
      const containerRect = containerRef.current!.getBoundingClientRect()
      const rootRect = rootNodeRef.current!.getBoundingClientRect()

      // 计算起点：根节点的右侧中心 (相对于 container)
      const startX = rootRect.right - containerRect.left
      const startY = rootRect.top + rootRect.height / 2 - containerRect.top

      const newPaths = results.map((_, index) => {
        const itemEl = itemRefs.current[index]
        if (!itemEl) return ''

        const itemRect = itemEl.getBoundingClientRect()
        // 计算终点：子节点的左侧中心
        const endX = itemRect.left - containerRect.left
        const endY = itemRect.top + itemRect.height / 2 - containerRect.top

        // 生成贝塞尔曲线
        // M 起点 C 控制点1 控制点2 终点
        // 这里简单的取中点作为控制点 X 坐标
        const controlPointX = (startX + endX) / 2

        return `M ${startX},${startY} C ${controlPointX},${startY} ${controlPointX},${endY} ${endX},${endY}`
      })
      setSvgPaths(newPaths)
    }

    // 延迟确保 DOM 渲染完成
    const timer = setTimeout(calculatePaths, 100)
    // 监听窗口缩放，重新画线
    window.addEventListener('resize', calculatePaths)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculatePaths)
    }
  }, [results, drawerVisible]) // 依赖 results 变化时重新计算

  const handleItemClick = (item: RootCauseResult) => {
    setSelectedNode(item)
    const mockLogs: DetailLog[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `err-${i}`,
      time: `2026-02-04 14:${30 + i}:${15 + i}`,
      level: 'ERROR',
      message:
        item.type === 'client'
          ? `Uncaught Exception in ${item.value}: NullPointerException`
          : `TimeoutException: Connection to ${item.value} timed out`,
      stack: `at com.example.service.OrderService.create(OrderService.java:42)\n   at com.example.controller.OrderController.submit(OrderController.java:108)`,
    }))
    setDetailLogs(mockLogs)
    setDrawerVisible(true)
  }

  return (
    <div className="root-cause-container">
      {/* 左侧：列表 */}
      <Card
        className="analysis-card"
        title={
          <span>
            <AimOutlined /> 根因定位控制台
          </span>
        }
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={handleAnalyze}
            danger={results.length > 3}
          >
            {results.length > 0 ? '重新诊断' : '开始全链路归因分析'}
          </Button>
        </div>
        <div className="result-list" style={{ overflowY: 'auto' }}>
          {results.length > 0
            ? results.map((item, index) => (
                <div
                  key={index}
                  className="suspect-item"
                  onClick={() => handleItemClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <Space>
                    <Tag color={item.score > 80 ? 'red' : 'orange'}>{item.dimension}</Tag>
                    <span style={{ fontWeight: 500 }}>{item.value}</span>
                  </Space>
                  <div
                    style={{
                      marginTop: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: '#999',
                    }}
                  >
                    <span>{item.description}</span>
                    <span
                      style={{ color: item.score > 80 ? '#ff4d4f' : '#faad14', fontWeight: 'bold' }}
                    >
                      {item.score}分 <RightOutlined />
                    </span>
                  </div>
                </div>
              ))
            : !loading && <Empty description="暂无异常" />}
        </div>
      </Card>

      {/* 右侧：纯 React 实现的拓扑图 */}
      <Card
        className="analysis-card"
        title={
          <span>
            <DeploymentUnitOutlined /> 影响链路拓扑
          </span>
        }
        bodyStyle={{ padding: 0 }}
      >
        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 3. 绑定 containerRef */}
            <div className="topology-viewport" ref={containerRef}>
              {/* SVG 连线层 */}
              <svg
                className="connections-layer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                {svgPaths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={results[i]?.score > 80 ? '#ffccc7' : '#e8e8e8'}
                    strokeWidth="2"
                  />
                ))}
              </svg>

              {/* 1. 根节点：绑定 rootNodeRef */}
              <div className="root-node" ref={rootNodeRef}>
                异常总集
                <br />
                (N={results.length})
              </div>

              {/* 2. 子节点列表 */}
              <div className="leaf-nodes-column">
                {results.map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      itemRefs.current[index] = el
                    }}
                    className={`leaf-node-card ${item.score > 80 ? 'high-risk' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="score-badge">{item.score}%</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.dimension}
                    </Text>
                    <h4>{item.value}</h4>

                    {/* 左侧的小连接点装饰 */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -5,
                        top: '50%',
                        marginTop: -3,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: item.score > 80 ? '#ff4d4f' : '#1890ff',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 底部结论 */}
            <div
              style={{
                margin: 20,
                padding: 16,
                background: '#fff2f0',
                borderRadius: 8,
                border: '1px solid #ffccc7',
              }}
            >
              <Title level={5} type="danger" style={{ marginTop: 0 }}>
                <WarningOutlined /> AI 综合排查结论：
              </Title>
              <Text>
                核心根因指向 <b>App版本 (2.4.0-beta)</b> 和 <b>数据库 (CPU过高)</b>。
              </Text>
            </div>
          </div>
        ) : (
          <div
            className="chart-area"
            style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text type="secondary">暂无数据</Text>
          </div>
        )}
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={
          <span>
            <FileTextOutlined /> 根因证据链分析
          </span>
        }
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedNode && (
          <div>
            <Card
              type="inner"
              style={{
                background: selectedNode.score > 80 ? '#fff1f0' : '#f0f5ff',
                marginBottom: 24,
                border: 'none',
              }}
            >
              <Descriptions column={1}>
                <Descriptions.Item label="疑似根因">
                  <Text strong style={{ fontSize: 16 }}>
                    {selectedNode.value}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="归因维度">
                  <Tag>{selectedNode.dimension}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="置信度">
                  <Progress
                    percent={selectedNode.score}
                    status={selectedNode.score > 80 ? 'exception' : 'active'}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="AI 描述">{selectedNode.description}</Descriptions.Item>
              </Descriptions>
            </Card>
            <Title level={5}>
              <ClockCircleOutlined /> 异常时序分布
            </Title>
            <Timeline style={{ marginTop: 20 }}>
              {detailLogs.map((log) => (
                <Timeline.Item key={log.id} color="red">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>{log.time.split(' ')[1]}</Text>
                      <div style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>
                        {log.message}
                      </div>
                    </div>

                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, height: 'auto' }}
                      onClick={() => handleDeepAnalysis(log)}
                    >
                      <FileTextOutlined /> 深度解析此日志
                    </Button>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
            <Title level={5} style={{ marginTop: 20 }}>
              <CodeOutlined /> 堆栈采样
            </Title>
            <div
              style={{
                background: '#1e1e1e',
                padding: 12,
                borderRadius: 6,
                color: '#d4d4d4',
                fontSize: 12,
                fontFamily: 'monospace',
                overflowX: 'auto',
              }}
            >
              {detailLogs[0]?.stack || 'No stack trace available.'}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
