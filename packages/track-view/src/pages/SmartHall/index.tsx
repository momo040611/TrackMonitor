import React, { useMemo } from 'react'
import { Tabs, Typography } from 'antd'
import { TrackingCopilot } from './components/TrackingCopilot/TrackingCopilot'
import { LogParser } from './components/LogParser/LogParser'
import { AnomalyDiagnosis } from './components/AnomalyDiagnosis/AnomalyDiagnosis'
import { RootCauseAnalysis } from './components/RootCauseAnalysis/RootCauseAnalysis'
import { SmartDispatch } from './components/SmartDispatch/SmartDispatch'
import { SmartHallProvider } from './context/SmartHallProvider'
import { useSmartHall } from './hooks/useSmartHall'
import { SmartHallTabKey, type SmartHallTabKeyType } from './constants'
import {
  CodeOutlined,
  BugOutlined,
  FileTextOutlined,
  AimOutlined,
  PartitionOutlined,
} from '@ant-design/icons'
import './SmartHall.less'

const { Title, Paragraph } = Typography

/**
 * Tab 配置映射表
 * 集中管理所有 Tab 的配置信息，便于维护和扩展
 */
const TAB_CONFIG = {
  [SmartHallTabKey.TRACKING_COPILOT]: {
    label: '辅助埋点',
    icon: CodeOutlined,
  },
  [SmartHallTabKey.ANOMALY_DIAGNOSIS]: {
    label: '异常诊断',
    icon: BugOutlined,
  },
  [SmartHallTabKey.LOG_PARSER]: {
    label: '日志智能解析',
    icon: FileTextOutlined,
  },
  [SmartHallTabKey.ROOT_CAUSE_ANALYSIS]: {
    label: '根因定位',
    icon: AimOutlined,
  },
  [SmartHallTabKey.SMART_DISPATCH]: {
    label: '智能分派',
    icon: PartitionOutlined,
  },
} as const

/**
 * 渲染 Tab 标签的辅助函数
 */
const renderTabLabel = (key: SmartHallTabKeyType, IconComponent: React.ComponentType) => (
  <span>
    <IconComponent />
    {TAB_CONFIG[key].label}
  </span>
)

/**
 * SmartHall 内部组件 - 使用 Context
 */
const SmartHallContent: React.FC = () => {
  const { activeTab, setActiveTab } = useSmartHall()

  // 使用 useMemo 缓存 items 配置，避免每次渲染都重新创建
  const items = useMemo(
    () => [
      {
        key: SmartHallTabKey.TRACKING_COPILOT,
        label: renderTabLabel(SmartHallTabKey.TRACKING_COPILOT, CodeOutlined),
        children: <TrackingCopilot />,
      },
      {
        key: SmartHallTabKey.ANOMALY_DIAGNOSIS,
        label: renderTabLabel(SmartHallTabKey.ANOMALY_DIAGNOSIS, BugOutlined),
        children: <AnomalyDiagnosis />,
      },
      {
        key: SmartHallTabKey.LOG_PARSER,
        label: renderTabLabel(SmartHallTabKey.LOG_PARSER, FileTextOutlined),
        children: <LogParser />,
      },
      {
        key: SmartHallTabKey.ROOT_CAUSE_ANALYSIS,
        label: renderTabLabel(SmartHallTabKey.ROOT_CAUSE_ANALYSIS, AimOutlined),
        children: <RootCauseAnalysis />,
      },
      {
        key: SmartHallTabKey.SMART_DISPATCH,
        label: renderTabLabel(SmartHallTabKey.SMART_DISPATCH, PartitionOutlined),
        children: <SmartDispatch />,
      },
    ],
    []
  )

  return (
    <div className="smart-hall-container">
      <div className="header-section">
        <Title level={2}> AI 智能赋能大厅</Title>
        <Paragraph type="secondary">利用 AI 提升监控效率，实现埋点自动化与故障快速定位。</Paragraph>
      </div>

      <div className="tabs-wrapper">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as SmartHallTabKeyType)}
          items={items}
          size="large"
          destroyOnHidden={false}
        />
      </div>
    </div>
  )
}

/**
 * SmartHall 入口组件 - 提供 Context
 */
const SmartHall: React.FC = () => {
  return (
    <SmartHallProvider>
      <SmartHallContent />
    </SmartHallProvider>
  )
}

export default SmartHall
