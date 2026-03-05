import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

interface TypeDistributionData {
  type: string
  value: number
  color: string
}

interface EventTypeChartProps {
  typeDistributionData: TypeDistributionData[]
}

const EventTypeChart: React.FC<EventTypeChartProps> = ({ typeDistributionData }) => {
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

  return (
    <div style={{ height: 300 }}>
      <ReactECharts
        option={pieChartOption}
        style={{ width: '100%', height: '100%' }}
        echarts={echarts}
      />
    </div>
  )
}

export default EventTypeChart
