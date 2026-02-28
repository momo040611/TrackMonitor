import React, { useMemo } from 'react'
import { Card, Row, Col, Select, Spin, Statistic } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, BarChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import { usePerformanceData } from './usePerformanceData'

echarts.use([
  LineChart,
  PieChart,
  BarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])
const { Option } = Select

const PerformanceAnalysis: React.FC = () => {
  const { timeRange, setTimeRange, isLoading, performanceData } = usePerformanceData()

  const coreMetricsChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '核心性能指标趋势', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: performanceData.coreMetrics.map((item) => item.name), bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - 6 + i)
          return d.toISOString().split('T')[0]
        }),
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value' },
      series: performanceData.coreMetrics.map((metric) => ({
        name: metric.name,
        type: 'line',
        data: Array.from({ length: 7 }, () => Math.random() * 1000),
        smooth: true,
        lineStyle: {
          color: metric.name.includes('FCP')
            ? '#1890ff'
            : metric.name.includes('LCP')
              ? '#52c41a'
              : metric.name.includes('TTI')
                ? '#faad14'
                : metric.name.includes('CLS')
                  ? '#f5222d'
                  : '#722ed1',
        },
      })),
    }),
    [performanceData.coreMetrics]
  )

  const apiRequestChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '接口请求分析', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      legend: { data: ['请求耗时'], bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: performanceData.apiRequests
          .slice(0, 10)
          .map((item) => item.url.split('/').pop() || ''),
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value', name: '耗时 (ms)' },
      series: [
        {
          name: '请求耗时',
          type: 'bar',
          data: performanceData.apiRequests.slice(0, 10).map((item) => item.duration),
          itemStyle: {
            color: (params: any) =>
              params.value < 200 ? '#52c41a' : params.value < 500 ? '#faad14' : '#f5222d',
          },
        },
      ],
    }),
    [performanceData.apiRequests]
  )

  const resourceChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '资源加载分析', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 10, top: 20 },
      series: [
        {
          name: '资源类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: { show: true, position: 'center', formatter: '{b}: {c}\n({d}%)' },
          data: [
            {
              value: performanceData.resources.filter((r) => r.type === 'script').length,
              name: 'JS',
            },
            {
              value: performanceData.resources.filter((r) => r.type === 'style').length,
              name: 'CSS',
            },
            {
              value: performanceData.resources.filter((r) => r.type === 'image').length,
              name: '图片',
            },
            {
              value: performanceData.resources.filter((r) => r.type === 'font').length,
              name: '字体',
            },
            {
              value: performanceData.resources.filter((r) => r.type === 'other').length,
              name: '其他',
            },
          ],
        },
      ],
    }),
    [performanceData.resources]
  )

  const longTaskChartOption = useMemo<EChartsOption>(
    () => ({
      title: { text: '长任务监控', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}:00`) },
      yAxis: { type: 'value', name: '任务耗时 (ms)' },
      series: [
        {
          name: '长任务耗时',
          type: 'scatter',
          data: performanceData.longTasks
            .slice(0, 50)
            .map((task, index) => [index % 24, task.duration]),
          itemStyle: {
            color: (params: any) =>
              params.value[1] < 50 ? '#52c41a' : params.value[1] < 250 ? '#faad14' : '#f5222d',
          },
        },
      ],
    }),
    [performanceData.longTasks]
  )

  // 辅助函数，安全获取指标数据
  const getMetricValue = (name: string) =>
    performanceData.coreMetrics.find((m) => m.name === name)?.value || 0

  return (
    <Card title="性能分析" variant="outlined" style={{ background: '#fff' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
        <Select value={timeRange} onChange={setTimeRange} style={{ width: 140 }}>
          <Option value="7days">近 7 天</Option>
          <Option value="30days">近 30 天</Option>
          <Option value="90days">近 90 天</Option>
        </Select>
      </div>

      <Spin spinning={isLoading} tip="加载中...">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <MetricCard
              title="首次内容绘制 (FCP)"
              value={getMetricValue('FCP')}
              suffix="ms"
              color="#52c41a"
              bg="#f6ffed"
              desc="衡量页面首次显示内容的时间"
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <MetricCard
              title="最大内容绘制 (LCP)"
              value={getMetricValue('LCP')}
              suffix="ms"
              color="#1890ff"
              bg="#e6f7ff"
              desc="衡量页面主要内容加载完成的时间"
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <MetricCard
              title="可交互时间 (TTI)"
              value={getMetricValue('TTI')}
              suffix="ms"
              color="#faad14"
              bg="#fff7e6"
              desc="衡量页面可交互的时间"
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <MetricCard
              title="累积布局偏移 (CLS)"
              value={getMetricValue('CLS')}
              suffix=""
              color="#f5222d"
              bg="#fff1f0"
              desc="衡量页面布局稳定性"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="核心性能指标趋势" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={coreMetricsChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="接口请求分析" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={apiRequestChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="资源加载分析" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={resourceChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="长任务监控" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={longTaskChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </Card>
  )
}

const MetricCard = ({ title, value, suffix, color, bg, desc }: any) => (
  <Card variant="outlined" style={{ background: bg }}>
    <Statistic
      title={title}
      value={value}
      suffix={suffix}
      styles={{ content: { fontSize: 20, fontWeight: 600, color } }}
    />
    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{desc}</div>
  </Card>
)

export default PerformanceAnalysis
