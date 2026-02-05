import React, { useState } from 'react'
import { Card, Input, Button, Typography, Space, Tag, message, Empty, Spin } from 'antd'
import { CopyOutlined, BulbOutlined, ThunderboltOutlined, CodeOutlined } from '@ant-design/icons'
import { useAiAssistant } from '../../hooks/useAiAssistant'
import { useTypewriter } from '../../hooks/useTypewriter'
// 引入代码高亮组件
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// 引入一款类似 VS Code 的暗色主题 (vscDarkPlus)
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

// 引入样式文件
import './TrackingCopilot.less'

const { TextArea } = Input
const { Text } = Typography

export const TrackingCopilot: React.FC = () => {
  const { copilot } = useAiAssistant()
  const [input, setInput] = useState('')
  const typedCode = useTypewriter(copilot.result, 20)

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
          typedCode && (
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
              <Spin tip="AI 正在构建埋点方案..." />
            </div>
          ) : typedCode ? (
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '20px',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'transparent',
                minHeight: '100%',
              }}
              showLineNumbers={true}
            >
              {typedCode}
            </SyntaxHighlighter>
          ) : (
            <Empty
              className="empty-state"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="在左侧输入需求，AI 将为您生成代码"
            />
          )}
        </div>
      </Card>
    </div>
  )
}
