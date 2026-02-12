import React, { useMemo, useState } from 'react'
import { Card, Tabs, Table, Statistic, Row, Col, Typography, Button, Space, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  aggregateFromCleaned,
  type AggregatedMetric,
  type TimeBucketMetric,
} from '../services/data-aggregation'
import type { CleanedRecord } from '../services/data-cleaning'
import { api } from '../../../api/request'
import './DataAggregationPanel.less'

const { Title, Text } = Typography

const totalColumns: ColumnsType<AggregatedMetric> = [
  { title: '事件', dataIndex: 'event', key: 'event' },
  { title: '次数', dataIndex: 'count', key: 'count' },
  { title: '唯一用户数', dataIndex: 'userCount', key: 'userCount' },
  { title: '平均值', dataIndex: 'avgValue', key: 'avgValue' },
]

const timeColumns: ColumnsType<TimeBucketMetric> = [
  { title: '时间窗口', dataIndex: 'bucket', key: 'bucket' },
  { title: '事件', dataIndex: 'event', key: 'event' },
  { title: '次数', dataIndex: 'count', key: 'count' },
]

interface DataAggregationPanelProps {
  cleaned: CleanedRecord[]
}

interface AiAnalysisResult {
  insights: string[]
  recommendations: string[]
  trends: any[]
}

const DataAggregationPanel: React.FC<DataAggregationPanelProps> = ({ cleaned }) => {
  const data = useMemo(() => aggregateFromCleaned(cleaned), [cleaned])
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAiAnalysis = async () => {
    if (cleaned.length === 0) {
      message.warning('请先清洗数据，再进行 AI 分析')
      return
    }

    setIsAnalyzing(true)
    try {
      const params = { projectId: 'default', timeRange: '24h' }
      const result = await api.analyzeAllEvents(params)

      if (result.data && result.data.code === 200) {
        setAiAnalysis({
          insights: result.data.data?.insights || [],
          recommendations: result.data.data?.recommendations || [],
          trends: result.data.data?.trends || [],
        })
        message.success('AI 分析完成')
      }
    } catch (error) {
      console.error('AI 分析失败:', error)
      message.error('AI 分析失败，请检查网络连接')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="data-aggregation-panel">
      <Title level={4}>数据聚合概览</Title>
      <Text>对清洗后的埋点数据进行统计和时间窗口聚合，为多维度分析提供基础。</Text>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={handleAiAnalysis}
          loading={isAnalyzing}
          disabled={cleaned.length === 0}
        >
          AI 分析数据
        </Button>
      </Space>
      <Row gutter={16} className="data-aggregation-summary">
        <Col span={6}>
          <Statistic title="总事件数" value={data.summary.totalEvents} />
        </Col>
        <Col span={6}>
          <Statistic title="唯一用户" value={data.summary.uniqueUsers} />
        </Col>
        <Col span={6}>
          <Statistic title="事件种类" value={data.summary.eventTypes} />
        </Col>
        <Col span={6}>
          <Statistic title="平均值(全局)" value={data.summary.globalAvgValue} precision={2} />
        </Col>
      </Row>
      <Tabs
        className="data-aggregation-tabs"
        items={[
          {
            key: 'total',
            label: '按事件汇总',
            children: (
              <Table
                size="small"
                rowKey={(row) => `${row.event}`}
                dataSource={data.byEvent}
                columns={totalColumns}
                pagination={false}
              />
            ),
          },
          {
            key: 'time',
            label: '时间窗口聚合',
            children: (
              <Table
                size="small"
                rowKey={(row) => `${row.bucket}-${row.event}`}
                dataSource={data.byTimeBucket}
                columns={timeColumns}
                pagination={false}
              />
            ),
          },
          {
            key: 'ai',
            label: 'AI 分析结果',
            children: aiAnalysis ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>关键洞察:</Text>
                {aiAnalysis.insights.map((insight, index) => (
                  <Text key={index} style={{ display: 'block' }}>
                    • {insight}
                  </Text>
                ))}
                <Text strong style={{ marginTop: 16 }}>
                  推荐建议:
                </Text>
                {aiAnalysis.recommendations.map((recommendation, index) => (
                  <Text key={index} style={{ display: 'block' }}>
                    • {recommendation}
                  </Text>
                ))}
              </Space>
            ) : (
              <Text>请点击上方按钮进行 AI 分析</Text>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default DataAggregationPanel
