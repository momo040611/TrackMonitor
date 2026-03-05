import React from 'react'
import { Card, Input, Button } from 'antd'
import { FileTextOutlined, ThunderboltOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface LogInputProps {
  inputText: string
  setInputText: (text: string) => void
  loading: boolean
  onParse: () => void
}

const LogInput: React.FC<LogInputProps> = ({ inputText, setInputText, loading, onParse }) => {
  return (
    <Card
      className="input-card"
      title={
        <span>
          <FileTextOutlined /> 原始日志 (Raw Log)
        </span>
      }
    >
      <p className="instruction-text">输入任意非结构化日志，AI 将自动提取关键信息：</p>

      <TextArea
        className="log-input"
        rows={10}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="粘贴日志内容..."
      />

      <div className="action-area">
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          block
          size="large"
          loading={loading}
          onClick={onParse}
          className="generate-btn"
        >
          开始智能解析
        </Button>
      </div>
    </Card>
  )
}

export default LogInput
