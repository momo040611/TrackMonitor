import React, { useState, useEffect } from 'react'
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
  ExportOutlined,
} from '@ant-design/icons'
import { AiService } from '../../services/useAiAssistant'
import './LogParser.less'

const { Text } = Typography
const { TextArea } = Input

//  定义 Props
interface Props {
  initialLog?: string
  onDispatch?: (content: string) => void
}

interface LogParseResult {
  event: string
  risk_level: string // 'high' | 'medium' | 'low'
  confidence: number
  ai_summary: string
  timestamp: string
  user: {
    id: string
    device_os: string
  }
  metrics: {
    latency: string
    status: string
  }
  properties: {
    [key: string]: any // 动态属性
  }
}

export const LogParser: React.FC<Props> = ({ initialLog, onDispatch }) => {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [parseResult, setParseResult] = useState<LogParseResult | null>(null)

  const mockLog = `[2026-01-31 10:23:45] [INFO] [UserTrace] uid:88231 action:video_play_start video_id:v9921 source:feed_recommend device:ios_17 duration:0ms`

  const [inputText, setInputText] = useState(mockLog)

  useEffect(() => {
    if (initialLog) {
      setInputText(initialLog)
      message.info('已加载关联的根因日志')
    }
  }, [initialLog])

  const mockResult = {
    event: 'video_play_start',
    risk_level: 'high',
    user: {
      id: '88231',
      device_os: 'iOS 17',
    },
    properties: {
      video_id: 'v9921',
      source_page: 'feed_recommend',
      status: 'started',
    },
    metrics: {
      latency: '450ms',
      status: '502 Bad Gateway',
    },
    timestamp: '2026-01-31 10:23:45',
    confidence: 0.98,
    ai_summary: '检测到用户在 iOS 17 环境下启动视频播放失败，且伴随高延迟与 502 网关错误。', // 新增
  }

  const handleSimulateParse = async () => {
    setLoading(true)
    setParseResult(null)
    setCurrentStep(0)

    // 模拟处理流程的步骤更新
    setTimeout(() => setCurrentStep(1), 800) // 向量化
    setTimeout(() => setCurrentStep(2), 2000) // 大模型推理
    setTimeout(() => setCurrentStep(3), 3000) // 结构化

    try {
      // 调用后端接口获取日志解析数据
      const result = await AiService.sendAiQuery(`解析以下日志：${inputText}`)

      // 处理返回的数据
      if (result && result.parsedData) {
        setParseResult(result.parsedData)
        message.success('日志解析完成')
      } else {
        // 如果没有数据，使用默认数据
        setParseResult(mockResult)
        message.success('日志解析完成 (使用默认数据)')
      }
    } catch (error) {
      message.error('日志解析失败，请稍后重试')
      console.error('日志解析失败:', error)

      // 出错时使用默认数据
      setParseResult(mockResult)
    } finally {
      setLoading(false)
    }
  }

  const handleToDispatch = () => {
    if (!parseResult || !onDispatch) return

    const taskContext = `
【日志分析转工单】${parseResult.ai_summary || '日志异常检测'}
-------------------------
[事件类型] ${parseResult.event}
[风险等级] ${(parseResult.risk_level || 'unknown').toUpperCase()}
[置信度] ${(parseResult.confidence * 100).toFixed(0)}%
[关键指标] ${JSON.stringify(parseResult.metrics || {})}

[涉及实体]
- 用户: ${parseResult.user?.id} (${parseResult.user?.device_os})
- 属性: ${JSON.stringify(parseResult.properties)}

[原始日志]
${inputText.substring(0, 150)}...
    `.trim()

    onDispatch(taskContext)
    message.loading('正在同步至分派台...', 0.5)
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
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
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
              <>
                <pre className="result-content">{JSON.stringify(parseResult, null, 2)}</pre>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0',
                    textAlign: 'right',
                  }}
                >
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    onClick={handleToDispatch}
                    // 如果父组件没传回调，则禁用按钮
                    disabled={!onDispatch}
                  >
                    转派工单
                  </Button>
                </div>
              </>
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
