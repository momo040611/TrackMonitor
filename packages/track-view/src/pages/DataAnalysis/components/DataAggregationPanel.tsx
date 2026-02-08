import React, { useMemo } from 'react'
import { Card, Tabs, Table, Statistic, Row, Col, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  aggregateFromCleaned,
  type AggregatedMetric,
  type TimeBucketMetric,
} from '../services/data-aggregation'
import type { CleanedRecord } from '../services/data-cleaning'
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

const DataAggregationPanel: React.FC<DataAggregationPanelProps> = ({ cleaned }) => {
  const data = useMemo(() => aggregateFromCleaned(cleaned), [cleaned])

  return (
    <Card className="data-aggregation-panel">
      <Title level={4}>数据聚合概览</Title>
      <Text>对清洗后的埋点数据进行统计和时间窗口聚合，为多维度分析提供基础。</Text>
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
        ]}
      />
    </Card>
  )
}

export default DataAggregationPanel
