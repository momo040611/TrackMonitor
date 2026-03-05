import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])

interface TrendData {
  date: string
  clicks: number
  impressions: number
}

interface EventTrendChartProps {
  trendData: TrendData[]
}

const EventTrendChart: React.FC<EventTrendChartProps> = ({ trendData }) => {
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

  return (
    <div style={{ height: 300 }}>
      <ReactECharts
        option={lineChartOption}
        style={{ width: '100%', height: '100%' }}
        echarts={echarts}
      />
    </div>
  )
}

export default EventTrendChart
