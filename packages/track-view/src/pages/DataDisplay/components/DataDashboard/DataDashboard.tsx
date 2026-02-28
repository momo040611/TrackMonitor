import React, { useMemo } from 'react'
import { Card, Row, Col, Spin, Statistic } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import ErrorMonitor from '../ErrorMonitor'
import PerformanceAnalysis from '../PerformanceAnalysis'
import { useDashboardData } from './useDashboardData'

echarts.use([
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])

const DataDashboard: React.FC = () => {
  const {
    isLoading,
    overviewData,
    trendData,
    typeDistributionData,
    realtimeData,
    realtimeChartData,
  } = useDashboardData()

  // 只有当 trendData 改变时，线型图配置才会重新计算，无视10s 一次的定时器刷新
  const lineChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '近30天事件趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['点击量', '曝光量'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: trendData.map((item) => item.date),
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '点击量',
          type: 'line',
          data: trendData.map((item) => item.clicks),
          smooth: true,
          lineStyle: { color: '#1890ff' },
        },
        {
          name: '曝光量',
          type: 'line',
          data: trendData.map((item) => item.impressions),
          smooth: true,
          lineStyle: { color: '#52c41a' },
        },
      ],
    }),
    [trendData]
  )

  // 当 typeDistributionData 改变时，饼图配置才会重新计算
  const pieChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '事件类型占比', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 10, top: 20 },
      series: [
        {
          name: '数量',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: true, position: 'center', formatter: '{b}: {c}\n({d}%)' },
          emphasis: {
            label: { fontSize: 12, fontWeight: 'bold' },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
          },
          data: typeDistributionData.map((item) => ({
            name: item.type,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    [typeDistributionData]
  )

  // 这个图表依赖 realtimeChartData，随着 10s 定时器正常重绘
  const realtimeChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '实时上报趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Array.from({ length: 10 }, (_, i) => `${i * 10}s`),
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '上报量',
          type: 'line',
          data:
            realtimeChartData.length > 0 ? realtimeChartData : Array.from({ length: 10 }, () => 0),
          smooth: true,
          lineStyle: { color: '#f5222d' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 34, 45, 0.3)' },
              { offset: 1, color: 'rgba(245, 34, 45, 0.1)' },
            ]),
          },
        },
      ],
    }),
    [realtimeChartData]
  )

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
                <div style={{ height: 300 }}>
                  <ReactECharts
                    option={lineChartOption}
                    style={{ width: '100%', height: '100%' }}
                    echarts={echarts}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="事件类型占比" variant="outlined" style={{ background: '#fff' }}>
                <div style={{ height: 300 }}>
                  <ReactECharts
                    option={pieChartOption}
                    style={{ width: '100%', height: '100%' }}
                    echarts={echarts}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={24}>
              <Card title="实时上报" variant="outlined" style={{ background: '#fff' }}>
                <Row gutter={16}>
                  <Col xs={24} md={6}>
                    <Statistic
                      title="当前上报量"
                      value={realtimeData}
                      styles={{ content: { fontSize: 32, fontWeight: 600, color: '#f5222d' } }}
                    />
                    <div style={{ marginTop: '16px' }}>
                      <span style={{ fontSize: 14, color: '#666' }}>刷新频率: 10s/次</span>
                    </div>
                  </Col>
                  <Col xs={24} md={18}>
                    <div style={{ height: 200 }}>
                      <ReactECharts
                        option={realtimeChartOption}
                        style={{ width: '100%', height: '100%' }}
                        echarts={echarts}
                      />
                    </div>
                  </Col>
                </Row>
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

const StatisticCard = ({ title, value, icon, color, bg }: any) => (
  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <div
      style={{
        textAlign: 'center',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: bg,
        width: '100%',
      }}
    >
      <div style={{ fontSize: 14, color: '#666', marginBottom: '8px', fontWeight: 500 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ marginRight: '8px', fontSize: 20 }}>{icon}</span>
        {value}
      </div>
    </div>
  </div>
)

export default DataDashboard
