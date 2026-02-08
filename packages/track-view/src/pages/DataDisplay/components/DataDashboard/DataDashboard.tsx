import { useState, useRef, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Radio,
  Space,
  Statistic,
  Badge,
  Spin,
  message,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { LineChart, PieChart, FunnelChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 导入 API 接口
import { api } from '../../../../api/request'

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

const DataDashboard = () => {
  // 状态管理
  const [selectedProject, setSelectedProject] = useState('project1')
  const [timeRange, setTimeRange] = useState('today')
  const [trackingDimension, setTrackingDimension] = useState('single')
  const [activeMetric, setActiveMetric] = useState('clicks')
  const [realtimeData, setRealtimeData] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // API 数据状态
  const [overviewData, setOverviewData] = useState({
    totalPV: 0,
    totalUV: 0,
    todayTracking: 0,
    yoyGrowth: 0,
    momGrowth: 0,
  })
  const [trendData, setTrendData] = useState<
    { date: string; clicks: number; impressions: number }[]
  >([])
  const [typeDistributionData, setTypeDistributionData] = useState<
    { type: string; value: number; color: string }[]
  >([])
  const [topTrackingData, setTopTrackingData] = useState<{ name: string; clicks: number }[]>([])
  const [funnelData, setFunnelData] = useState<{ name: string; value: number; color: string }[]>([])

  // Ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chartRefs = useRef<{
    line?: any
    pie?: any
    bar?: any
    funnel?: any
    realtime?: any
  }>({})

  // 数据获取函数
  const fetchData = async () => {
    try {
      setIsLoading(true)

      // 并行请求所有数据
      const [overviewRes, trendRes, typeDistributionRes, topTrackingRes, funnelRes] =
        await Promise.all([
          api.getOverviewData({ projectId: selectedProject, timeRange }),
          api.getTrendData({
            projectId: selectedProject,
            timeRange,
            metrics: ['clicks', 'impressions'],
          }),
          api.getTypeDistributionData({ projectId: selectedProject, timeRange }),
          api.getTopTrackingData({ projectId: selectedProject, timeRange, limit: 10 }),
          api.getFunnelData({ projectId: selectedProject, timeRange }),
        ])

      // 更新状态
      setOverviewData(
        overviewRes.data || {
          totalPV: 0,
          totalUV: 0,
          todayTracking: 0,
          yoyGrowth: 0,
          momGrowth: 0,
        }
      )

      setTrendData(trendRes.data || [])
      setTypeDistributionData(typeDistributionRes.data || [])
      setTopTrackingData(topTrackingRes.data || [])
      setFunnelData(funnelRes.data || [])
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 获取实时数据
  const fetchRealtimeData = async () => {
    try {
      const res = await api.getRealtimeData({ projectId: selectedProject })
      setRealtimeData(res.data?.count || 0)
    } catch (error) {
      console.error('获取实时数据失败:', error)
    }
  }

  // ECharts 配置项
  // 1. 折线图配置（实时趋势）
  const lineChartOption = {
    title: { text: '近30天数据趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { data: ['点击量', '曝光量'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.length > 0 ? trendData.map((item) => item.date) : [],
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '点击量',
        type: 'line',
        data: trendData.length > 0 ? trendData.map((item) => item.clicks) : [],
        smooth: true,
        lineStyle: { color: '#1890ff' },
      },
      {
        name: '曝光量',
        type: 'line',
        data: trendData.length > 0 ? trendData.map((item) => item.impressions) : [],
        smooth: true,
        lineStyle: { color: '#52c41a' },
      },
    ],
  }

  // 2. 饼图配置（埋点类型占比）
  const pieChartOption = {
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
        data:
          typeDistributionData.length > 0
            ? typeDistributionData.map((item) => ({
                name: item.type,
                value: item.value,
                itemStyle: { color: item.color },
              }))
            : [],
      },
    ],
  }

  // 3. 柱状图配置（热门埋点 TOP10）
  const barChartOption = {
    title: { text: '热门埋点 TOP10', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: topTrackingData.length > 0 ? topTrackingData.map((item) => item.name) : [],
      axisLabel: { rotate: 0 },
    },
    series: [
      {
        name: '点击量',
        type: 'bar',
        data: topTrackingData.length > 0 ? topTrackingData.map((item) => item.clicks) : [],
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  // 4. 漏斗图配置（转化漏斗）
  const funnelChartOption = {
    title: { text: '转化漏斗', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    legend: { data: funnelData.length > 0 ? funnelData.map((item) => item.name) : [], bottom: 0 },
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
        data:
          funnelData.length > 0
            ? funnelData.map((item) => ({
                name: item.name,
                value: item.value,
                itemStyle: { color: item.color },
              }))
            : [],
      },
    ],
  }

  // 5. 实时上报折线图配置
  const realtimeChartOption = {
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
        data: Array.from({ length: 10 }, () => realtimeData),
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

  // 初始化加载和参数变化时获取数据
  useEffect(() => {
    fetchData()
  }, [selectedProject, timeRange])

  // 实时数据更新
  useEffect(() => {
    // 初始获取一次实时数据
    fetchRealtimeData()

    // 每 10 秒更新一次实时数据
    intervalRef.current = setInterval(() => {
      fetchRealtimeData()
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [selectedProject])

  return (
    <>
      {/* 顶部筛选 */}
      <Card style={{ marginBottom: '24px', background: '#fff' }}>
        <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>项目：</span>
            <Select value={selectedProject} onChange={setSelectedProject} style={{ width: 140 }}>
              <Select.Option value="project1">项目1</Select.Option>
              <Select.Option value="project2">项目2</Select.Option>
              <Select.Option value="project3">项目3</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 140 }}>
              <Select.Option value="today">今日</Select.Option>
              <Select.Option value="7days">近 7 天</Select.Option>
              <Select.Option value="30days">近 30 天</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
            {timeRange === 'custom' && (
              <DatePicker.RangePicker
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
              <Select.Option value="clicks">点击量</Select.Option>
              <Select.Option value="impressions">曝光量</Select.Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* 核心卡片 */}
      <Spin spinning={isLoading} tip="加载中...">
        <Row gutter={[16, 16]}>
          {/* 全局概览卡 */}
          <Col xs={24} lg={24}>
            <Card title="全局概览" variant="outlined" style={{ background: '#fff' }}>
              <Row gutter={[24, 16]}>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="总 PV"
                    value={overviewData.totalPV}
                    prefix={<Badge status="success" />}
                    styles={{ content: { fontSize: 20, fontWeight: 600 } }}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="总 UV"
                    value={overviewData.totalUV}
                    prefix={<Badge status="processing" />}
                    styles={{ content: { fontSize: 20, fontWeight: 600 } }}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="今日埋点上报量"
                    value={overviewData.todayTracking}
                    prefix={<Badge status="default" />}
                    styles={{ content: { fontSize: 20, fontWeight: 600 } }}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={4}>
                  <Statistic
                    title="同比增长"
                    value={overviewData.yoyGrowth}
                    suffix="%"
                    prefix={<Badge status="success" />}
                    styles={{ content: { fontSize: 20, fontWeight: 600, color: '#52c41a' } }}
                  />
                </Col>
                <Col xs={12} sm={12} md={4} lg={4}>
                  <Statistic
                    title="实时上报量"
                    value={realtimeData}
                    prefix={<Badge status="warning" />}
                    styles={{ content: { fontSize: 20, fontWeight: 600, color: '#f5222d' } }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 埋点趋势卡 */}
          <Col xs={24} lg={12}>
            <Card title="埋点趋势" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  ref={(e) => {
                    chartRefs.current.line = e?.getEchartsInstance()
                  }}
                  option={lineChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 埋点类型占比卡 */}
          <Col xs={24} lg={12}>
            <Card title="埋点类型占比" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  ref={(e) => {
                    chartRefs.current.pie = e?.getEchartsInstance()
                  }}
                  option={pieChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 热门埋点 TOP10 */}
          <Col xs={24} lg={12}>
            <Card title="热门埋点 TOP10" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  ref={(e) => {
                    chartRefs.current.bar = e?.getEchartsInstance()
                  }}
                  option={barChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 转化漏斗卡 */}
          <Col xs={24} lg={12}>
            <Card title="转化漏斗" variant="outlined" style={{ background: '#fff' }}>
              <div style={{ height: 300 }}>
                <ReactECharts
                  ref={(e) => {
                    chartRefs.current.funnel = e?.getEchartsInstance()
                  }}
                  option={funnelChartOption}
                  style={{ width: '100%', height: '100%' }}
                  echarts={echarts}
                />
              </div>
            </Card>
          </Col>

          {/* 实时上报卡 */}
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
                      ref={(e) => {
                        chartRefs.current.realtime = e?.getEchartsInstance()
                      }}
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
    </>
  )
}

export default DataDashboard
