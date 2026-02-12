import React, { useState, useRef, useEffect } from 'react'
import { Card, Row, Col, Spin, Statistic, message } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  ImportOutlined,
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
import { useLocation } from 'react-router-dom'
import ErrorMonitor from '../ErrorMonitor'
import PerformanceAnalysis from '../PerformanceAnalysis'
import { api } from '../../../../api/request'
import sharedDataService from '../../../../services/sharedDataService'

// 注册 ECharts 组件
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
  const location = useLocation()

  // 状态管理
  const [realtimeData, setRealtimeData] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasImportedData, setHasImportedData] = useState<boolean>(false)

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
  const [realtimeChartData, setRealtimeChartData] = useState<number[]>([])

  // Ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 检查并导入从 DataAnalysis 页面导出的数据
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const source = params.get('source')
    const exported = params.get('exported')

    if (source === 'data-analysis' && exported === 'true') {
      importDataFromAnalysis()
    }
  }, [location.search])

  // 从 DataAnalysis 导入数据
  const importDataFromAnalysis = () => {
    const processedData = sharedDataService.getProcessedData({ type: 'cleaned-data' })

    if (processedData.length > 0) {
      // 处理导入的数据，这里可以根据实际需求进行转换和使用
      console.log('导入的数据:', processedData)
      message.success(`成功导入 ${processedData.length} 条处理后的数据`)
      setHasImportedData(true)

      // 这里可以根据导入的数据更新相应的状态
      // 例如：更新概览数据、趋势数据等
    } else {
      message.warning('没有找到可导入的数据')
    }
  }

  // 手动导入数据
  const handleManualImport = () => {
    importDataFromAnalysis()
  }

  // 获取数据的函数
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // 获取概览数据
      const overviewResult = await api.getOverviewData()
      if (overviewResult.data && overviewResult.data.code === 200) {
        setOverviewData(overviewResult.data)
      }

      // 获取趋势数据
      const trendResult = await api.getTrendData()
      if (trendResult.data && trendResult.data.code === 200) {
        setTrendData(trendResult.data)
      }

      // 获取类型分布数据
      const typeDistributionResult = await api.getTypeDistributionData()
      if (typeDistributionResult.data && typeDistributionResult.data.code === 200) {
        setTypeDistributionData(typeDistributionResult.data)
      }
      // 获取实时数据
      const realtimeResult = await api.getRealtimeData()
      if (realtimeResult.data && realtimeResult.data.code === 200) {
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
  // 1. 折线图配置（事件趋势）
  const lineChartOption: EChartsOption = {
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
  }

  // 2. 饼图配置（事件类型占比）
  const pieChartOption: EChartsOption = {
    title: { text: '事件类型占比', left: 'center', textStyle: { fontSize: 14 } },
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

  // 3. 实时上报折线图配置
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
        const realtimeResult = await api.getRealtimeData()
        if (realtimeResult.data && realtimeResult.data.code === 200) {
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
      {/* 数据概览部分 */}
      <div style={{ marginBottom: '24px' }}>
        <Spin spinning={isLoading} tip="加载中...">
          <Row gutter={[16, 16]}>
            {/* 全局概览卡 */}
            <Col xs={24} lg={24}>
              <Card title="全局概览" variant="outlined" style={{ background: '#fff' }}>
                <Row gutter={[24, 16]} align="middle">
                  <Col
                    xs={24}
                    sm={12}
                    md={6}
                    lg={6}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#fff1f0',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          color: '#666',
                          marginBottom: '8px',
                          fontWeight: 500,
                        }}
                      >
                        今日错误总数
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: '#f5222d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AlertOutlined style={{ marginRight: '8px', fontSize: 20 }} />
                        {overviewData.totalPV}
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    md={6}
                    lg={6}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#f6ffed',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          color: '#666',
                          marginBottom: '8px',
                          fontWeight: 500,
                        }}
                      >
                        API请求成功率
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: '#52c41a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircleOutlined style={{ marginRight: '8px', fontSize: 20 }} />
                        {overviewData.totalUV}%
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    md={6}
                    lg={6}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#e6f7ff',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          color: '#666',
                          marginBottom: '8px',
                          fontWeight: 500,
                        }}
                      >
                        今日事件上报量
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BarChartOutlined style={{ marginRight: '8px', fontSize: 20 }} />
                        {overviewData.todayTracking}
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={24}
                    sm={12}
                    md={6}
                    lg={6}
                    style={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '16px',
                        borderRadius: '8px',
                        backgroundColor: '#f9f0ff',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          color: '#666',
                          marginBottom: '8px',
                          fontWeight: 500,
                        }}
                      >
                        实时事件上报量
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: '#722ed1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ThunderboltOutlined style={{ marginRight: '8px', fontSize: 20 }} />
                        {realtimeData}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* 事件趋势卡 */}
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

            {/* 事件类型占比卡 */}
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

      {/* 错误监控部分 */}
      <div style={{ marginBottom: '24px' }}>
        <ErrorMonitor />
      </div>

      {/* 性能分析部分 */}
      <div style={{ marginBottom: '24px' }}>
        <PerformanceAnalysis />
      </div>
    </div>
  )
}

export default DataDashboard
