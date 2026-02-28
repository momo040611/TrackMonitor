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
import { useRootCauseAnalysis, type RootCauseResult, type DetailLog } from './useRootCauseAnalysis'
import './RootCauseAnalysis.less'

const { Title, Text } = Typography

interface Props {
  onAnalyzeLog?: (log: string) => void
}

export const RootCauseAnalysis: React.FC<Props> = ({ onAnalyzeLog }) => {
  const {
    loading,
    results,
    drawerVisible,
    setDrawerVisible,
    selectedNode,
    detailLogs,
    handleAnalyze,
    handleItemClick,
    handleDeepAnalysis,
  } = useRootCauseAnalysis(onAnalyzeLog)

  // 主视图布局
  return (
    <div className="root-cause-container">
      {/* 左侧：列表区域 */}
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

      {/* 右侧：抽离的拓扑可视化组件 */}
      <Card
        className="analysis-card"
        title={
          <span>
            <DeploymentUnitOutlined /> 影响链路拓扑
          </span>
        }
        styles={{ body: { padding: 0 } }}
      >
        <TopologyGraph
          results={results}
          onItemClick={handleItemClick}
          triggerResize={drawerVisible}
        />
      </Card>

      {/* 底部：抽离的详情抽屉组件 */}
      <DetailDrawer
        visible={drawerVisible}
        node={selectedNode}
        logs={detailLogs}
        onClose={() => setDrawerVisible(false)}
        onDeepAnalysis={handleDeepAnalysis}
      />
    </div>
  )
}

// React SVG 拓扑图
const TopologyGraph = ({
  results,
  onItemClick,
  triggerResize,
}: {
  results: RootCauseResult[]
  onItemClick: (item: RootCauseResult) => void
  triggerResize: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rootNodeRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [svgPaths, setSvgPaths] = useState<string[]>([])

  useEffect(() => {
    if (results.length === 0 || !containerRef.current || !rootNodeRef.current) return
    const calculatePaths = () => {
      const containerRect = containerRef.current!.getBoundingClientRect()
      const rootRect = rootNodeRef.current!.getBoundingClientRect()
      const startX = rootRect.right - containerRect.left
      const startY = rootRect.top + rootRect.height / 2 - containerRect.top

      const newPaths = results.map((_, index) => {
        const itemEl = itemRefs.current[index]
        if (!itemEl) return ''
        const itemRect = itemEl.getBoundingClientRect()
        const endX = itemRect.left - containerRect.left
        const endY = itemRect.top + itemRect.height / 2 - containerRect.top
        const controlPointX = (startX + endX) / 2
        return `M ${startX},${startY} C ${controlPointX},${startY} ${controlPointX},${endY} ${endX},${endY}`
      })
      setSvgPaths(newPaths)
    }

    const timer = setTimeout(calculatePaths, 100)
    window.addEventListener('resize', calculatePaths)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculatePaths)
    }
  }, [results, triggerResize]) // 依赖 drawer 变化以重新计算线条

  if (results.length === 0)
    return (
      <div
        className="chart-area"
        style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text type="secondary">暂无数据</Text>
      </div>
    )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="topology-viewport" ref={containerRef}>
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
        <div className="root-node" ref={rootNodeRef}>
          异常总集
          <br />
          (N={results.length})
        </div>
        <div className="leaf-nodes-column">
          {results.map((item, index) => (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              className={`leaf-node-card ${item.score > 80 ? 'high-risk' : ''}`}
              onClick={() => onItemClick(item)}
            >
              <div className="score-badge">{item.score}%</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.dimension}
              </Text>
              <h4>{item.value}</h4>
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
  )
}

// 详情证据链抽屉
const DetailDrawer = ({
  visible,
  node,
  logs,
  onClose,
  onDeepAnalysis,
}: {
  visible: boolean
  node: RootCauseResult | null
  logs: DetailLog[]
  onClose: () => void
  onDeepAnalysis: (log: DetailLog) => void
}) => (
  <Drawer
    title={
      <span>
        <FileTextOutlined /> 根因证据链分析
      </span>
    }
    size={500}
    onClose={onClose}
    open={visible}
  >
    {node && (
      <div>
        <Card
          type="inner"
          style={{
            background: node.score > 80 ? '#fff1f0' : '#f0f5ff',
            marginBottom: 24,
            border: 'none',
          }}
        >
          <Descriptions column={1}>
            <Descriptions.Item label="疑似根因">
              <Text strong style={{ fontSize: 16 }}>
                {node.value}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="归因维度">
              <Tag>{node.dimension}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="置信度">
              <Progress percent={node.score} status={node.score > 80 ? 'exception' : 'active'} />
            </Descriptions.Item>
            <Descriptions.Item label="AI 描述">{node.description}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Title level={5}>
          <ClockCircleOutlined /> 异常时序分布
        </Title>
        <Timeline style={{ marginTop: 20 }}>
          {logs.map((log) => (
            <Timeline.Item key={log.id} color="red">
              <Space orientation="vertical" style={{ width: '100%' }}>
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
                  onClick={() => onDeepAnalysis(log)}
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
          {logs[0]?.stack || 'No stack trace available.'}
        </div>
      </div>
    )}
  </Drawer>
)
