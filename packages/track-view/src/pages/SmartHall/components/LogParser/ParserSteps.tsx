import React from 'react'
import { Steps } from 'antd'
import {
  FileSearchOutlined,
  DeploymentUnitOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'

interface ParserStepsProps {
  currentStep: number
}

const ParserSteps: React.FC<ParserStepsProps> = ({ currentStep }) => {
  return (
    <div className="parser-steps-container">
      <Steps
        current={currentStep}
        size="small"
        items={[
          {
            title: '日志采集',
            content: 'Raw Log',
            icon: <FileSearchOutlined />,
          },
          {
            title: '向量嵌入',
            content: 'Sentence-BERT',
            icon: <DeploymentUnitOutlined />,
          },
          {
            title: '大模型推理',
            content: 'GPT-4o / Qwen',
            icon: <CloudServerOutlined />,
          },
          {
            title: '结构化存储',
            content: 'Structured DB',
            icon: <DatabaseOutlined />,
          },
        ]}
      />
    </div>
  )
}

export default ParserSteps
