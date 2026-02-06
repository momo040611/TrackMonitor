import React, { useState } from 'react'
import { Tabs, Typography } from 'antd'
import { TrackingCopilot } from './components/TrackingCopilot/TrackingCopilot'
import { LogParser } from './components/LogParser/LogParser'
import { AnomalyDiagnosis } from './components/AnomalyDiagnosis/AnomalyDiagnosis'
import { RootCauseAnalysis } from './components/RootCauseAnalysis/RootCauseAnalysis'
import { SmartDispatch } from './components/SmartDispatch/SmartDispatch'
import {
  CodeOutlined,
  BugOutlined,
  FileTextOutlined,
  AimOutlined,
  PartitionOutlined,
} from '@ant-design/icons'
import './SmartHall.less'

const { Title, Paragraph } = Typography

const SmartHall: React.FC = () => {
  const [activeTab, setActiveTab] = useState('2')
  const [dispatchTask, setDispatchTask] = useState<string>('')
  const [logContext, setLogContext] = useState<string>('')

  const handleGoToDispatch = (issueContent: string) => {
    setDispatchTask(issueContent)
    setActiveTab('5')
  }

  const handleAnalyzeLog = (rawLog: string) => {
    setLogContext(rawLog)
    setActiveTab('3')
  }

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
      children: <AnomalyDiagnosis onDispatch={handleGoToDispatch} />,
    },
    {
      key: '3',
      label: (
        <span>
          <FileTextOutlined /> 日志智能解析
        </span>
      ),
      children: <LogParser initialLog={logContext} onDispatch={handleGoToDispatch} />,
    },
    {
      key: '4',
      label: (
        <span>
          <AimOutlined /> 根因定位
        </span>
      ),
      children: <RootCauseAnalysis onAnalyzeLog={handleAnalyzeLog} />,
    },
    {
      key: '5',
      label: (
        <span>
          <PartitionOutlined /> 智能分派
        </span>
      ),
      children: <SmartDispatch initialTask={dispatchTask} />,
    },
  ]

  return (
    <div className="smart-hall-container">
      <div className="header-section">
        <Title level={2}> AI 智能赋能大厅</Title>
        <Paragraph type="secondary">利用 AI 提升监控效率，实现埋点自动化与故障快速定位。</Paragraph>
      </div>

      <div className="tabs-wrapper">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab} // 允许手动切换
          items={items}
          size="large"
        />
      </div>
    </div>
  )
}

export default SmartHall
