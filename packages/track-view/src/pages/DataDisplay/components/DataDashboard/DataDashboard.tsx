import React from 'react'
import { Card, Row, Col, Spin } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import ErrorMonitor from '../ErrorMonitor'
import PerformanceAnalysis from '../PerformanceAnalysis'
import { useDashboardData } from './useDashboardData'
import StatisticCard from './StatisticCard'
import EventTrendChart from './EventTrendChart'
import EventTypeChart from './EventTypeChart'
import RealtimeReportChart from './RealtimeReportChart'

const DataDashboard: React.FC = () => {
  const {
    isLoading,
    overviewData,
    trendData,
    typeDistributionData,
    realtimeData,
    realtimeChartData,
  } = useDashboardData()

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Spin spinning={isLoading} tip="加载中...">
          <Row gutter={[16, 16]}>
            {/* 顶部数据概览 */}
            <Col xs={24} lg={24}>
              <Card title="全局概览" variant="outlined" style={{ background: '#fff' }}>
                <Row gutter={[24, 16]} align="middle">
                  <Col xs={24} sm={12} md={6} lg={6}>
                    <StatisticCard
                      title="今日错误总数"
                      value={overviewData.totalPV}
                      icon={<AlertOutlined />}
                      color="#f5222d"
                      bg="#fff1f0"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6}>
                    <StatisticCard
                      title="API请求成功率"
                      value={`${overviewData.totalUV}%`}
                      icon={<CheckCircleOutlined />}
                      color="#52c41a"
                      bg="#f6ffed"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6}>
                    <StatisticCard
                      title="今日事件上报量"
                      value={overviewData.todayTracking}
                      icon={<BarChartOutlined />}
                      color="#1890ff"
                      bg="#e6f7ff"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6}>
                    <StatisticCard
                      title="实时事件上报量"
                      value={realtimeData}
                      icon={<ThunderboltOutlined />}
                      color="#722ed1"
                      bg="#f9f0ff"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* 图表展示区 */}
            <Col xs={24} lg={12}>
              <Card title="事件趋势" variant="outlined" style={{ background: '#fff' }}>
                <EventTrendChart trendData={trendData} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="事件类型占比" variant="outlined" style={{ background: '#fff' }}>
                <EventTypeChart typeDistributionData={typeDistributionData} />
              </Card>
            </Col>
            <Col xs={24} lg={24}>
              <Card title="实时上报" variant="outlined" style={{ background: '#fff' }}>
                <RealtimeReportChart
                  realtimeData={realtimeData}
                  realtimeChartData={realtimeChartData}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
      <div style={{ marginBottom: '24px' }}>
        <ErrorMonitor />
      </div>
      <div style={{ marginBottom: '24px' }}>
        <PerformanceAnalysis />
      </div>
    </div>
  )
}

export default DataDashboard
