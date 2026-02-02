import React from 'react'
import { Tabs, Typography } from 'antd'
import { TrackingCopilot } from './components/TrackingCopilot/TrackingCopilot'
import { LogParser } from './components/LogParser/LogParser'
import { AnomalyDiagnosis } from './components/AnomalyDiagnosis/AnomalyDiagnosis'
import { CodeOutlined, BugOutlined, FileTextOutlined } from '@ant-design/icons'
import './SmartHall.less'

const { Title, Paragraph } = Typography

const SmartHall: React.FC = () => {
  const items = [
    {
      key: '1',
      label: (
        <span>
          <CodeOutlined />
          辅助埋点
        </span>
      ),
      children: <TrackingCopilot />,
    },
    {
      key: '2',
      label: (
        <span>
          <BugOutlined /> 异常诊断
        </span>
      ),
      children: <AnomalyDiagnosis />,
    },
    {
      key: '3',
      label: (
        <span>
          <FileTextOutlined /> 日志智能解析
        </span>
      ),
      children: <LogParser />,
    },
  ]

  return (
    <div className="smart-hall-container">
      <div className="header-section">
        <Title level={2}> AI 智能赋能大厅</Title>
        <Paragraph type="secondary">利用 AI 提升监控效率，实现埋点自动化与故障快速定位。</Paragraph>
      </div>

      <div className="tabs-wrapper">
        <Tabs defaultActiveKey="1" items={items} size="large" />
      </div>
    </div>
  )
}

export default SmartHall
