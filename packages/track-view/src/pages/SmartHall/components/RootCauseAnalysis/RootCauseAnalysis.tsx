import React from 'react'
import { Card, Button, Tag, Space, Empty } from 'antd'
import {
  AimOutlined,
  SearchOutlined,
  DeploymentUnitOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useRootCauseAnalysis } from './useRootCauseAnalysis'
import { TopologyGraph, DetailDrawer } from './components'
import { RISK_THRESHOLD } from './constants'
import './RootCauseAnalysis.less'

export const RootCauseAnalysis: React.FC = () => {
  const {
    loading,
    results,
    drawerVisible,
    setDrawerVisible,
    selectedNode,
    detailLogs,
    handleAnalyze,
    handleItemClick,
    handleDeepAnalysis,
  } = useRootCauseAnalysis()

  const hasResults = results.length > 0
  const hasManyIssues = results.length > 3

  return (
    <div className="root-cause-container">
      {/* 左侧：列表区域 */}
      <Card
        className="analysis-card"
        title={
          <span>
            <AimOutlined /> 根因定位控制台
          </span>
        }
      >
        <div className="analyze-button-wrapper">
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={handleAnalyze}
            danger={hasManyIssues}
          >
            {hasResults ? '重新诊断' : '开始全链路归因分析'}
          </Button>
        </div>
        <div className="result-list">
          {hasResults
            ? results.map((item, index) => (
                <div key={index} className="suspect-item" onClick={() => handleItemClick(item)}>
                  <Space>
                    <Tag color={item.score > RISK_THRESHOLD.HIGH ? 'red' : 'orange'}>
                      {item.dimension}
                    </Tag>
                    <span className="item-value">{item.value}</span>
                  </Space>
                  <div className="item-footer">
                    <span className="item-description">{item.description}</span>
                    <span
                      className={`item-score ${item.score > RISK_THRESHOLD.HIGH ? 'high' : 'medium'}`}
                    >
                      {item.score}分 <RightOutlined />
                    </span>
                  </div>
                </div>
              ))
            : !loading && <Empty description="暂无异常" />}
        </div>
      </Card>

      {/* 右侧：拓扑可视化 */}
      <Card
        className="analysis-card"
        title={
          <span>
            <DeploymentUnitOutlined /> 影响链路拓扑
          </span>
        }
        styles={{ body: { padding: 0 } }}
      >
        <TopologyGraph
          results={results}
          onItemClick={handleItemClick}
          triggerResize={drawerVisible}
        />
      </Card>

      {/* 详情抽屉 */}
      <DetailDrawer
        visible={drawerVisible}
        node={selectedNode}
        logs={detailLogs}
        onClose={() => setDrawerVisible(false)}
        onDeepAnalysis={handleDeepAnalysis}
      />
    </div>
  )
}
