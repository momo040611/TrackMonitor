import React, { useState, useRef, useEffect } from 'react'
import { Card, Row, Col, DatePicker, Select, Radio, Space, Spin, Statistic, Badge } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, FunnelChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  LineChart,
  PieChart,
  FunnelChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])

const { RangePicker } = DatePicker
const { Option } = Select

// 类型定义
interface OverviewData {
  totalPV: number
  totalUV: number
  todayTracking: number
  yoyGrowth: number
  momGrowth: number
}

interface TrendDataItem {
  date: string
  clicks: number
  impressions: number
}

interface TypeDistributionItem {
  type: string
  value: number
  percentage: number
  color: string
}

interface TopTrackingItem {
  key: number
  name: string
  clicks: number
  status: string
}

interface FunnelItem {
  name: string
  value: number
  percentage: number
  color: string
}

interface RealtimeData {
  current: number
  trend: number[]
}

const DataDashboard: React.FC = () => {
  // 状态管理
  const [selectedProject, setSelectedProject] = useState<string>('project1')
  const [timeRange, setTimeRange] = useState<string>('today')
  const [trackingDimension, setTrackingDimension] = useState<string>('single')
  const [activeMetric, setActiveMetric] = useState<string>('clicks')
  const [realtimeData, setRealtimeData] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 数据状态
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalPV: 0,
    totalUV: 0,
    todayTracking: 0,
    yoyGrowth: 0,
    momGrowth: 0,
  })
  const [trendData, setTrendData] = useState<TrendDataItem[]>([])
  const [typeDistributionData, setTypeDistributionData] = useState<TypeDistributionItem[]>([])
  const [topTrackingData, setTopTrackingData] = useState<TopTrackingItem[]>([])
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([])
  const [realtimeChartData, setRealtimeChartData] = useState<number[]>([])

  // Ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chartRefs = useRef<{ [key: string]: any }>({})

  // 获取数据的函数
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // 获取概览数据
      const overviewResponse = await fetch('/api/analytics/overview')
      const overviewResult = await overviewResponse.json()
      if (overviewResult.code === 200) {
        setOverviewData(overviewResult.data)
      }

      // 获取趋势数据
      const trendResponse = await fetch('/api/analytics/trend')
      const trendResult = await trendResponse.json()
      if (trendResult.code === 200) {
        setTrendData(trendResult.data)
      }

      // 获取类型分布数据
      const typeDistributionResponse = await fetch('/api/analytics/type-distribution')
      const typeDistributionResult = await typeDistributionResponse.json()
      if (typeDistributionResult.code === 200) {
        setTypeDistributionData(typeDistributionResult.data)
      }

      // 获取热门埋点数据
      const topTrackingResponse = await fetch('/api/analytics/top-tracking')
      const topTrackingResult = await topTrackingResponse.json()
      if (topTrackingResult.code === 200) {
        setTopTrackingData(topTrackingResult.data)
      }

      // 获取转化漏斗数据
      const funnelResponse = await fetch('/api/analytics/funnel')
      const funnelResult = await funnelResponse.json()
      if (funnelResult.code === 200) {
        setFunnelData(funnelResult.data)
      }

      // 获取实时数据
      const realtimeResponse = await fetch('/api/analytics/realtime')
      const realtimeResult = await realtimeResponse.json()
      if (realtimeResult.code === 200) {
        setRealtimeData(realtimeResult.data.current)
        setRealtimeChartData(realtimeResult.data.trend)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ECharts 配置项
  // 1. 折线图配置（实时趋势）
  const lineChartOption: EChartsOption = {
    title: { text: '近30天数据趋势', left: 'center', textStyle: { fontSize: 14 } },
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
  }

  // 2. 饼图配置（埋点类型占比）
  const pieChartOption: EChartsOption = {
    title: { text: '埋点类型占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 10, top: 20 },
    series: [
      {
        name: '数量',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: '{b}: {c}\n({d}%)',
        },
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
  }

  // 3. 柱状图配置（热门埋点 TOP10）
  const barChartOption: EChartsOption = {
    title: { text: '热门埋点 TOP10', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: topTrackingData.map((item) => item.name),
      axisLabel: { rotate: 0 },
    },
    series: [
      {
        name: '点击量',
        type: 'bar',
        data: topTrackingData.map((item) => item.clicks),
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  // 4. 漏斗图配置（转化漏斗）
  const funnelChartOption: EChartsOption = {
    title: { text: '转化漏斗', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    legend: { data: funnelData.map((item) => item.name), bottom: 0 },
    series: [
      {
        name: '转化',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: { fontSize: 12 },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
        data: funnelData.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color },
        })),
      },
    ],
  }

  // 5. 实时上报折线图配置
  const realtimeChartOption: EChartsOption = {
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
  }

  // 初始化加载
  useEffect(() => {
    fetchData()
  }, [])

  // 实时数据更新
  useEffect(() => {
    const updateRealtimeData = async () => {
      try {
        const realtimeResponse = await fetch('/api/analytics/realtime')
        const realtimeResult = await realtimeResponse.json()
        if (realtimeResult.code === 200) {
          setRealtimeData(realtimeResult.data.current)
          setRealtimeChartData(realtimeResult.data.trend)
        }
      } catch (error) {
        console.error('获取实时数据失败:', error)
      }
    }

    // 初始更新一次
    updateRealtimeData()

    // 每10秒更新一次
    intervalRef.current = setInterval(updateRealtimeData, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div>
      {/* 顶部筛选 */}
      <Card style={{ marginBottom: '24px', background: '#fff' }}>
        <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>项目：</span>
            <Select value={selectedProject} onChange={setSelectedProject} style={{ width: 140 }}>
              <Option value="project1">项目1</Option>
              <Option value="project2">项目2</Option>
              <Option value="project3">项目3</Option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 140 }}>
              <Option value="today">今日</Option>
              <Option value="7days">近 7 天</Option>
              <Option value="30days">近 30 天</Option>
              <Option value="custom">自定义</Option>
            </Select>
            {timeRange === 'custom' && (
              <RangePicker
                onChange={(dates) => console.log('自定义日期范围:', dates)}
                style={{ marginLeft: '8px' }}
              />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点维度：</span>
            <Radio.Group
              value={trackingDimension}
              onChange={(e) => setTrackingDimension(e.target.value)}
            >
              <Radio.Button value="single">单埋点</Radio.Button>
              <Radio.Button value="multiple">多埋点对比</Radio.Button>
              <Radio.Button value="page">页面维度</Radio.Button>
            </Radio.Group>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>指标：</span>
            <Select value={activeMetric} onChange={setActiveMetric} style={{ width: 120 }}>
              <Option value="clicks">点击量</Option>
              <Option value="impressions">曝光量</Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* 核心卡片 */}
      <Spin spinning={isLoading} tip="加载中...">
        <Row gutter={[16, 16]}>
          {/* 全局概览卡 */}
          <Col xs={24} lg={24}>
            <Card title="全局概览" bordered={false} style={{ background: '#fff' }}>
              <Row gutter={[24, 16]}>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="总 PV"
                    value={overviewData.totalPV}
                    prefix={<Badge status="success" />}
                    valueStyle={{ fontSize: 20, fontWeight: 600 }}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="总 UV"
                    value={overviewData.totalUV}
                    prefix={<Badge status="processing" />}
                    valueStyle={{ fontSize: 20, fontWeight: 600 }}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="今日埋点上报量"
                    value={overviewData.todayTracking}
                    prefix={<Badge status="default" />}
                    valueStyle={{ fontSize: 20, fontWeight: 600 }}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="同比增长"
                    value={overviewData.yoyGrowth}
                    suffix="%"
                    prefix={<Badge status="success" />}
                    valueStyle={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={4} lg={4}>
                  <Statistic
                    title="环比增长"
                    value={overviewData.momGrowth}
                    suffix="%"
                    prefix={<Badge status="processing" />}
                    valueStyle={{ fontSize: 20, fontWeight: 600, color: '#faad14' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={4} lg={4}>
                  <Statistic
                    title="实时上报量"
                    value={realtimeData}
                    prefix={<Badge status="warning" />}
                    valueStyle={{ fontSize: 20, fontWeight: 600, color: '#f5222d' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 埋点趋势卡 */}
          <Col xs={24} lg={12}>
            <Card title="埋点趋势" bordered={false} style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={lineChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 埋点类型占比卡 */}
          <Col xs={24} lg={12}>
            <Card title="埋点类型占比" bordered={false} style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={pieChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 热门埋点 TOP10 */}
          <Col xs={24} lg={12}>
            <Card title="热门埋点 TOP10" bordered={false} style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={barChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 转化漏斗卡 */}
          <Col xs={24} lg={12}>
            <Card title="转化漏斗" bordered={false} style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  option={funnelChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 实时上报卡 */}
          <Col xs={24} lg={24}>
            <Card title="实时上报" bordered={false} style={{ background: '#fff' }}>
              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Statistic
                    title="当前上报量"
                    value={realtimeData}
                    valueStyle={{ fontSize: 32, fontWeight: 600, color: '#f5222d' }}
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
  )
}

export default DataDashboard
