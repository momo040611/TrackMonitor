import React from 'react'
import { Drawer, Card, Descriptions, Progress, Timeline, Button, Space, Typography } from 'antd'
import { FileTextOutlined, ClockCircleOutlined, CodeOutlined } from '@ant-design/icons'
import type { RootCauseResult, DetailLog } from '../useRootCauseAnalysis'
import { RISK_THRESHOLD } from '../constants'

const { Title, Text } = Typography

interface DetailDrawerProps {
  visible: boolean
  node: RootCauseResult | null
  logs: DetailLog[]
  onClose: () => void
  onDeepAnalysis: (log: DetailLog) => void
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  visible,
  node,
  logs,
  onClose,
  onDeepAnalysis,
}) => {
  if (!node) return null

  const isHighRisk = node.score > RISK_THRESHOLD.HIGH

  return (
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
      <Card type="inner" className={`detail-card ${isHighRisk ? 'high-risk' : ''}`}>
        <Descriptions column={1}>
          <Descriptions.Item label="疑似根因">
            <Text strong className="node-value">
              {node.value}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="归因维度">
            <Text>{node.dimension}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="置信度">
            <Progress percent={node.score} status={isHighRisk ? 'exception' : 'active'} />
          </Descriptions.Item>
          <Descriptions.Item label="AI 描述">{node.description}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={5} className="section-title">
        <ClockCircleOutlined /> 异常时序分布
      </Title>
      <Timeline className="error-timeline">
        {logs.map((log) => (
          <Timeline.Item key={log.id} color="red">
            <Space direction="vertical" className="timeline-content">
              <div>
                <Text strong>{log.time.split(' ')[1]}</Text>
                <div className="log-message">{log.message}</div>
              </div>
              <Button
                type="link"
                size="small"
                className="deep-analysis-btn"
                onClick={() => onDeepAnalysis(log)}
              >
                <FileTextOutlined /> 深度解析此日志
              </Button>
            </Space>
          </Timeline.Item>
        ))}
      </Timeline>

      <Title level={5} className="section-title">
        <CodeOutlined /> 堆栈采样
      </Title>
      <pre className="stack-trace">{logs[0]?.stack || 'No stack trace available.'}</pre>
    </Drawer>
  )
}
