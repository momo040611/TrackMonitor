import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Radio,
  Space,
  Button,
  Table,
  Input,
  Form,
  Tooltip,
  Popconfirm,
  Tabs,
  Statistic,
  Badge,
  Spin,
} from 'antd'
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
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'

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
const { TextArea } = Input
const { Item } = Form
const { TabPane } = Tabs

const DataDisplay: React.FC = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [selectedProject, setSelectedProject] = useState<string>('project1')
  const [timeRange, setTimeRange] = useState<string>('today')
  const [trackingType, setTrackingType] = useState<string>('click')
  const [trackingDimension, setTrackingDimension] = useState<string>('single')
  const [activeMetric, setActiveMetric] = useState<string>('clicks')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [url, setUrl] = useState<string>('')
  const [selectedTrackingType, setSelectedTrackingType] = useState<string>('click')
  const [realtimeData, setRealtimeData] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [form] = Form.useForm()

  // Ref
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chartRefs = useRef<{ [key: string]: any }>({})

  // 模拟数据
  const overviewData = {
    totalPV: 123456,
    totalUV: 78901,
    todayTracking: 5678,
    yoyGrowth: 12.5,
    momGrowth: 8.3,
  }

  // 趋势数据（用于折线图）
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 29 + i)
    return {
      date: date.toISOString().split('T')[0],
      clicks: Math.floor(Math.random() * 1000) + 500,
      impressions: Math.floor(Math.random() * 2000) + 1000,
    }
  })

  const typeDistributionData = [
    { type: '点击', value: 4500, percentage: 45, color: '#1890ff' },
    { type: '曝光', value: 3000, percentage: 30, color: '#52c41a' },
    { type: '激活', value: 1500, percentage: 15, color: '#faad14' },
    { type: '转化', value: 1000, percentage: 10, color: '#f5222d' },
  ]

  const topTrackingData = Array.from({ length: 10 }, (_, i) => ({
    key: i,
    name: `埋点${i + 1}`,
    clicks: Math.floor(Math.random() * 1000) + 100,
    status: i % 2 === 0 ? 'normal' : 'warning',
  })).sort((a, b) => b.clicks - a.clicks)

  const funnelData = [
    { name: '曝光', value: 10000, percentage: 100, color: '#1890ff' },
    { name: '点击', value: 6000, percentage: 60, color: '#52c41a' },
    { name: '激活', value: 3000, percentage: 30, color: '#faad14' },
    { name: '转化', value: 1500, percentage: 15, color: '#f5222d' },
  ]

  // 埋点配置数据
  const trackingData = [
    {
      key: '1',
      id: '#1001',
      name: '首页 Banner 点击',
      type: '点击',
      page: '/home',
      trigger: '元素点击',
      status: 'active',
      statusText: '已生效',
      statusIcon: '✅',
    },
    {
      key: '2',
      id: '#1002',
      name: '商品详情页曝光',
      type: '曝光',
      page: '/product',
      trigger: '页面加载',
      status: 'pending',
      statusText: '待发布',
      statusIcon: '⚠️',
    },
    {
      key: '3',
      id: '#1003',
      name: '支付按钮点击',
      type: '点击',
      page: '/pay',
      trigger: '元素点击',
      status: 'inactive',
      statusText: '已失效',
      statusIcon: '❌',
    },
  ]

  // 表格列配置
  const columns = [
    {
      title: '埋点 ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: any, b: any) => a.id.localeCompare(b.id),
    },
    {
      title: '埋点名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '所属页面',
      dataIndex: 'page',
      key: 'page',
    },
    {
      title: '触发条件',
      dataIndex: 'trigger',
      key: 'trigger',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <span
          style={{
            color: status === 'active' ? '#52c41a' : status === 'pending' ? '#faad14' : '#f5222d',
          }}
        >
          {record.statusIcon} {record.statusText}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          {record.status === 'active' && (
            <>
              <Button type="text" icon={<EyeOutlined />} size="small">
                预览
              </Button>
              <Popconfirm title="确定要失效吗？" onConfirm={() => {}}>
                <Button
                  type="text"
                  icon={<PauseCircleOutlined />}
                  size="small"
                  style={{ color: '#faad14' }}
                >
                  失效
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
              >
                发布
              </Button>
              <Popconfirm title="确定要删除吗？" onConfirm={() => {}}>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ color: '#f5222d' }}
                >
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'inactive' && (
            <>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
              >
                恢复
              </Button>
              <Popconfirm title="确定要删除吗？" onConfirm={() => {}}>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ color: '#f5222d' }}
                >
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
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
        data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 50),
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
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 实时数据更新
  useEffect(() => {
    setRealtimeData(Math.floor(Math.random() * 1000) + 500)

    intervalRef.current = setInterval(() => {
      setRealtimeData((prev) => prev + Math.floor(Math.random() * 100) + 10)
    }, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>数据可视化中心</h1>

      {/* Tab 切换 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: '24px' }}>
        <TabPane tab="数据可视化大屏" key="dashboard" />
        <TabPane tab="可视化埋点配置" key="tracking" />
      </Tabs>

      {activeTab === 'dashboard' && (
        <>
          {/* 顶部筛选 */}
          <Card style={{ marginBottom: '24px', background: '#fff' }}>
            <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>项目：</span>
                <Select
                  value={selectedProject}
                  onChange={setSelectedProject}
                  style={{ width: 140 }}
                >
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
                <Card title="埋点类型占比" bordered={false} style={{ background: '#fff' }}>
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
                <Card title="热门埋点 TOP10" bordered={false} style={{ background: '#fff' }}>
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
                <Card title="转化漏斗" bordered={false} style={{ background: '#fff' }}>
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
      )}

      {activeTab === 'tracking' && (
        <>
          {/* 顶部子筛选区 */}
          <Card style={{ marginBottom: '24px', background: '#fff' }}>
            <Row gutter={16} align="middle">
              {/* 全局筛选 */}
              <Col xs={24} md={16}>
                <Space size="middle" wrap>
                  <div>
                    <span style={{ marginRight: '8px', fontWeight: 500 }}>项目：</span>
                    <Select
                      value={selectedProject}
                      onChange={setSelectedProject}
                      style={{ width: 160 }}
                    >
                      <Option value="project1">项目1</Option>
                      <Option value="project2">项目2</Option>
                      <Option value="project3">项目3</Option>
                    </Select>
                  </div>
                  <div>
                    <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
                    <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
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
                  <div>
                    <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点类型：</span>
                    <Select value={trackingType} onChange={setTrackingType} style={{ width: 160 }}>
                      <Option value="click">点击</Option>
                      <Option value="exposure">曝光</Option>
                      <Option value="stay">停留</Option>
                      <Option value="custom">自定义</Option>
                    </Select>
                  </div>
                </Space>
              </Col>

              {/* 快捷操作 */}
              <Col xs={24} md={8} style={{ marginTop: '16px' }}>
                <Space size="middle" wrap style={{ float: 'right' }}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    新增埋点
                  </Button>
                  <Button>批量发布</Button>
                  <Button>批量失效</Button>
                  <Button danger>批量删除</Button>
                  <Tooltip title="导入配置">
                    <Button icon={<UploadOutlined />}>导入配置</Button>
                  </Tooltip>
                  <Tooltip title="导出配置">
                    <Button icon={<DownloadOutlined />}>导出配置</Button>
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 核心内容区 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: `calc(100vh - 240px)`,
            }}
          >
            {/* 上半部分：埋点配置列表 */}
            <Card style={{ flex: 0.6, overflow: 'hidden', background: '#fff' }}>
              <div style={{ height: 'calc(100% - 56px)', overflow: 'auto' }}>
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={trackingData}
                  pagination={{ pageSize: 10 }}
                  scroll={{ y: 'max-content' }}
                />
              </div>
            </Card>

            {/* 下半部分：可视化埋点编辑器 */}
            <Card style={{ flex: 0.4, overflow: 'hidden', background: '#fff' }}>
              <Row gutter={16} style={{ height: '100%' }}>
                {/* 页面预览区 */}
                <Col
                  xs={24}
                  md={12}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ marginRight: '8px', fontWeight: 500 }}>URL：</span>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      style={{ width: 200, marginRight: '8px' }}
                    />
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (iframeRef.current && url) {
                          iframeRef.current.src = url
                        }
                      }}
                    >
                      加载
                    </Button>
                    <Button
                      size="small"
                      style={{ marginLeft: '8px' }}
                      onClick={() => {
                        if (iframeRef.current) {
                          iframeRef.current.contentWindow?.location.reload()
                        }
                      }}
                    >
                      刷新
                    </Button>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      src=""
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="页面预览"
                    />
                  </div>
                </Col>

                {/* 配置表单区 */}
                <Col xs={24} md={12} style={{ height: '100%', overflow: 'auto' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点类型：</span>
                    <Radio.Group
                      value={selectedTrackingType}
                      onChange={(e) => setSelectedTrackingType(e.target.value)}
                      buttonStyle="solid"
                    >
                      <Radio.Button value="click">点击</Radio.Button>
                      <Radio.Button value="exposure">曝光</Radio.Button>
                      <Radio.Button value="stay">停留</Radio.Button>
                    </Radio.Group>
                  </div>

                  <Form form={form} layout="vertical">
                    <Item
                      label="埋点名称"
                      name="name"
                      rules={[{ required: true, message: '请输入埋点名称' }]}
                    >
                      <Input placeholder="请输入埋点名称" />
                    </Item>

                    <Item label="所属事件" name="event">
                      <Select style={{ width: '100%' }}>
                        <Option value="event1">事件1</Option>
                        <Option value="event2">事件2</Option>
                        <Option value="event3">事件3</Option>
                      </Select>
                    </Item>

                    <Item label="上报频率" name="frequency">
                      <Select style={{ width: '100%' }}>
                        <Option value="realtime">实时</Option>
                        <Option value="batch">批量</Option>
                      </Select>
                    </Item>

                    <Item label="自定义属性" name="properties">
                      <TextArea rows={3} placeholder="请输入自定义属性" />
                    </Item>

                    <Item label="触发条件" name="trigger">
                      <Select style={{ width: '100%' }}>
                        <Option value="click">点击</Option>
                        <Option value="exposure">曝光</Option>
                        <Option value="stay">停留时长≥X 秒</Option>
                      </Select>
                    </Item>

                    {selectedTrackingType === 'stay' && (
                      <Item label="停留时长" name="stayTime">
                        <Input
                          type="number"
                          placeholder="请输入停留时长（秒）"
                          style={{ width: '100%' }}
                        />
                      </Item>
                    )}

                    <Item label="备注" name="remark">
                      <TextArea rows={3} placeholder="请输入备注信息" />
                    </Item>

                    <Space size="middle" style={{ marginTop: '16px' }}>
                      <Button>保存草稿</Button>
                      <Button type="primary">预览效果</Button>
                      <Button type="primary" danger>
                        提交发布
                      </Button>
                    </Space>
                  </Form>
                </Col>
              </Row>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default DataDisplay
