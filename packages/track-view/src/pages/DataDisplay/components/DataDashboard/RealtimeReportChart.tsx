import React, { useMemo } from 'react'
import { Statistic, Row, Col } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer])

interface RealtimeReportChartProps {
  realtimeData: number
  realtimeChartData: number[]
}

const RealtimeReportChart: React.FC<RealtimeReportChartProps> = ({
  realtimeData,
  realtimeChartData,
}) => {
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
  )
}

export default RealtimeReportChart
