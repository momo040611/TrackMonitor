import React from 'react'
import { Card, Tag, Button, Spin, Empty } from 'antd'
import { CodeOutlined, CheckCircleOutlined, ExportOutlined } from '@ant-design/icons'
import type { LogParseResult } from './useLogParser'

interface LogResultProps {
  loading: boolean
  parseResult: LogParseResult | null
  inputText: string
  onDispatch?: (content: string) => void
}

const LogResult: React.FC<LogResultProps> = ({ loading, parseResult, inputText, onDispatch }) => {
  const handleDispatch = () => {
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
  }

  return (
    <Card
      className="preview-card"
      title={
        <div className="card-header">
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
            <div className="dispatch-action-area">
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleDispatch}
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
  )
}

export default LogResult
