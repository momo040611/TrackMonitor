import React, { useState } from 'react'
import { Tabs } from 'antd'
import {
  LineChartOutlined,
  SettingOutlined,
  AreaChartOutlined,
  BellOutlined,
} from '@ant-design/icons'
import DataDashboard from './components/DataDashboard/DataDashboard'
import TrackingConfig from './components/TrackingConfig/TrackingConfig'
import AiAnalysis from './components/AiAnalysis/AiAnalysis'
import AlarmCenter from './components/AlarmCenter/AlarmCenter'
import './index.less'

const DataDisplay = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard')

  const tabItems = [
    {
      key: 'dashboard',
      label: '数据可视化大屏',
      icon: <LineChartOutlined />,
      children: <DataDashboard />,
    },
    {
      key: 'tracking',
      label: '可视化埋点配置',
      icon: <SettingOutlined />,
      children: <TrackingConfig />,
    },
    {
      key: 'ai',
      label: 'AI 分析控制台',
      icon: <AreaChartOutlined />,
      children: <AiAnalysis />,
    },
    {
      key: 'alarm',
      label: '告警中心',
      icon: <BellOutlined />,
      children: <AlarmCenter />,
    },
  ]

  return (
    <div>
      <div className="pageContent">
        <h2 className="pageTitle">数据可视化中心</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          数据可视化中心，用于展示和配置SDK的使用数据和性能指标。
        </p>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="data-display-tabs"
        />
      </div>
    </div>
  )
}

export default DataDisplay
