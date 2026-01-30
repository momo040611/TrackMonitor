import React, { useState } from 'react'
import { Card, Input, Button, Typography, Space, Tag, message, Empty, Spin } from 'antd'
import { CopyOutlined, BulbOutlined, ThunderboltOutlined, CodeOutlined } from '@ant-design/icons'
import { useAiAssistant } from '../../hooks/useAiAssistant'

// 引入样式文件
import './TrackingCopilot.less'

const { TextArea } = Input
const { Text } = Typography

export const TrackingCopilot: React.FC = () => {
  const { copilot } = useAiAssistant()
  const [input, setInput] = useState('')

  const suggestions = ['监控购买按钮点击', '分析首页停留时间', '追踪异常白屏']

  const copyToClipboard = () => {
    if (copilot.result) {
      navigator.clipboard.writeText(copilot.result)
      message.success('代码已复制到剪贴板')
    }
  }

  return (
    <div className="tracking-copilot-container">
      {/* 左侧：输入区 */}
      <Card
        className="input-card"
        title={
          <span>
            <BulbOutlined /> 需求描述
          </span>
        }
      >
        <Text type="secondary" className="instruction-text">
          请用自然语言描述你想监控的业务场景：
        </Text>

        <TextArea
          className="requirement-input"
          rows={6}
          placeholder="例如：我想给‘立即下单’按钮加一个点击埋点，并上报当前商品ID..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Space wrap className="tags-wrapper">
          {suggestions.map((tag) => (
            <Tag
              key={tag}
              color="blue"
              className="suggestion-tag"
              onClick={() => setInput((prev) => prev + tag)}
            >
              + {tag}
            </Tag>
          ))}
        </Space>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          block
          size="large"
          loading={copilot.isLoading}
          onClick={() => copilot.generate(input)}
          className="generate-btn"
        >
          开始 AI 生成
        </Button>
      </Card>

      {/* 右侧：代码预览区 */}
      <Card
        className="preview-card"
        title={
          <span>
            <CodeOutlined /> AI 建议代码
          </span>
        }
        extra={
          copilot.result && (
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={copyToClipboard}
              className="copy-btn"
            >
              复制
            </Button>
          )
        }
      >
        <div className="code-viewport">
          {copilot.isLoading ? (
            <div className="loading-spin">
              <Spin tip="AI 正在构思代码..." />
            </div>
          ) : copilot.result ? (
            <pre className="code-content">{copilot.result}</pre>
          ) : (
            <Empty
              className="empty-state"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="在左侧输入需求，点击生成"
            />
          )}
        </div>
      </Card>
    </div>
  )
}
