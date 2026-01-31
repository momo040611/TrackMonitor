import React, { useState } from 'react'
import { Card, Steps, Typography, Input, Button, Spin, Empty, Tag, message } from 'antd'
import {
  FileSearchOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import './LogParser.less'

const { Text } = Typography
const { TextArea } = Input

export const LogParser: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [parseResult, setParseResult] = useState<string | null>(null)

  const mockLog = `[2026-01-31 10:23:45] [INFO] [UserTrace] uid:88231 action:video_play_start video_id:v9921 source:feed_recommend device:ios_17 duration:0ms`

  const mockResult = {
    event: 'video_play_start',
    user: {
      id: '88231',
      device_os: 'iOS 17',
    },
    properties: {
      video_id: 'v9921',
      source_page: 'feed_recommend',
      status: 'started',
    },
    timestamp: '2026-01-31 10:23:45',
    confidence: 0.98,
  }

  const handleSimulateParse = () => {
    setLoading(true)
    setParseResult(null)
    setCurrentStep(0)

    // 模拟处理流程
    setTimeout(() => setCurrentStep(1), 800) // 向量化
    setTimeout(() => setCurrentStep(2), 2000) // 大模型推理
    setTimeout(() => setCurrentStep(3), 3000) // 结构化

    setTimeout(() => {
      setLoading(false)
      setParseResult(JSON.stringify(mockResult, null, 2))
      message.success('日志解析完成')
    }, 3500)
  }

  return (
    <div className="log-parser-wrapper">
      <div className="log-parser-container">
        {/* 左侧：原始日志输入 */}
        <Card
          className="input-card"
          title={
            <span>
              <FileTextOutlined /> 原始日志 (Raw Log)
            </span>
          }
        >
          <Text type="secondary" className="instruction-text">
            输入任意非结构化日志，AI 将自动提取关键信息：
          </Text>

          <TextArea
            className="log-input"
            rows={12}
            defaultValue={mockLog}
            placeholder="粘贴日志内容..."
          />

          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            block
            size="large"
            loading={loading}
            onClick={handleSimulateParse}
            className="generate-btn"
          >
            开始智能解析
          </Button>
        </Card>

        {/* 右侧：结构化结果 */}
        <Card
          className="preview-card"
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <span>
                <CodeOutlined /> 结构化结果 (JSON)
              </span>
              {parseResult && !loading && (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  解析成功
                </Tag>
              )}
            </div>
          }
        >
          <div className="code-viewport">
            {loading ? (
              <div className="loading-spin">
                <Spin tip="AI 正在进行向量化与推理中..." />
              </div>
            ) : parseResult ? (
              <pre className="result-content">{parseResult}</pre>
            ) : (
              <Empty
                className="empty-state"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无解析结果"
              />
            )}
          </div>
        </Card>
      </div>

      {/* 底部：技术链路展示 */}
      <div className="parser-steps-container">
        <Steps
          current={currentStep}
          size="small"
          items={[
            {
              title: '日志采集',
              description: 'Raw Log',
              icon: <FileSearchOutlined />,
            },
            {
              title: '向量嵌入',
              description: 'Sentence-BERT',
              icon: <DeploymentUnitOutlined />,
            },
            {
              title: '大模型推理',
              description: 'GPT-4o / Qwen',
              icon: <CloudServerOutlined />,
            },
            {
              title: '结构化存储',
              description: 'Structured DB',
              icon: <DatabaseOutlined />,
            },
          ]}
        />
      </div>
    </div>
  )
}
