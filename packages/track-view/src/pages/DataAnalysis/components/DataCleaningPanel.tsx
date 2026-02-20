import React, { useMemo, useReducer } from 'react'
import { Card, Tabs, Table, Button, Space, Tag, Typography, Form, Switch, Checkbox } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { DataCleaningState } from '../../../store/modules/dataCleaning'
import { dataCleaningInitialState, dataCleaningReducer } from '../../../store/modules/dataCleaning'
import {
  applyCleaningPipeline,
  buildDefaultRules,
  type CleaningRule,
  type CleaningResult,
  type RawRecord,
  type CleanedRecord,
} from '../services/data-cleaning'
import './DataCleaningPanel.less'

const { Title, Text } = Typography

interface DataCleaningPanelProps {
  onCleanedChange?: (cleaned: CleanedRecord[]) => void
}

const DataCleaningPanel: React.FC<DataCleaningPanelProps> = ({ onCleanedChange }) => {
  const [state, dispatch] = useReducer(dataCleaningReducer, dataCleaningInitialState)

  const currentRules: CleaningRule = state.rules ?? buildDefaultRules()

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/api/analysis/sample-data')
      // 检查响应是否为 JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json()
        if (result.code === 200) {
          const sample = result.data
          dispatch({ type: 'setRawData', payload: sample })
          dispatch({ type: 'setRules', payload: currentRules })
          const cleaningResult = applyCleaningPipeline(sample, currentRules)
          dispatch({ type: 'setCleaningResult', payload: cleaningResult })
          if (onCleanedChange) {
            onCleanedChange(cleaningResult.cleaned)
          }
        }
      }
    } catch (error) {
      // 静默处理错误，不在控制台显示
      // 这样即使后端服务不可用，也不会在控制台出现错误信息
    }
  }

  const handleRulesChange = (partial: Partial<CleaningRule>) => {
    const nextRules: CleaningRule = { ...currentRules, ...partial }
    dispatch({ type: 'setRules', payload: nextRules })
    if (state.rawData.length > 0) {
      const result = applyCleaningPipeline(state.rawData, nextRules)
      dispatch({ type: 'setCleaningResult', payload: result })
      if (onCleanedChange) {
        onCleanedChange(result.cleaned)
      }
    }
  }

  const columns: ColumnsType<CleaningResult['cleaned'][number]> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'User ID', dataIndex: 'userId', key: 'userId' },
      { title: 'Event', dataIndex: 'event', key: 'event' },
      { title: 'Value', dataIndex: 'value', key: 'value' },
      { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    ],
    []
  )

  const rawColumns: ColumnsType<DataCleaningState['rawData'][number]> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'User ID', dataIndex: 'userId', key: 'userId' },
      { title: 'Event', dataIndex: 'event', key: 'event' },
      { title: 'Value', dataIndex: 'value', key: 'value' },
      { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    ],
    []
  )

  return (
    <Card className="data-cleaning-panel">
      <Space className="data-cleaning-header" orientation="vertical" size="small">
        <Title level={4}>数据清洗</Title>
        <Text>对原始埋点数据进行验证、去重、过滤和标准化，为后续聚合分析做准备。</Text>
        <Space>
          <Button type="primary" onClick={handleLoadSample}>
            加载示例数据并执行清洗
          </Button>
          {state.result && (
            <Space size="small">
              <Tag color="blue">原始: {state.rawData.length}</Tag>
              <Tag color="green">清洗后: {state.result.cleaned.length}</Tag>
              <Tag color="red">异常: {state.result.invalid.length}</Tag>
            </Space>
          )}
        </Space>
        <Card size="small" className="data-cleaning-rules" variant="outlined">
          <Space orientation="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>清洗规则</Text>
            <Form layout="inline" size="small">
              <Form.Item label="允许空值">
                <Switch
                  checked={currentRules.allowNullValue}
                  onChange={(checked) => handleRulesChange({ allowNullValue: checked })}
                />
              </Form.Item>
              <Form.Item label="校验时间戳">
                <Switch
                  checked={currentRules.requireValidTimestamp}
                  onChange={(checked) => handleRulesChange({ requireValidTimestamp: checked })}
                />
              </Form.Item>
            </Form>
            <Form layout="vertical" size="small">
              <Form.Item label="去重字段">
                <Checkbox.Group
                  options={(
                    [
                      { label: 'ID', value: 'id' },
                      { label: 'User ID', value: 'userId' },
                      { label: 'Event', value: 'event' },
                      { label: 'Timestamp', value: 'timestamp' },
                    ] as const
                  ).map((item) => item)}
                  value={currentRules.deduplicateBy}
                  onChange={(values) =>
                    handleRulesChange({
                      deduplicateBy: values as unknown as (keyof RawRecord)[],
                    })
                  }
                />
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Space>
      <Tabs
        className="data-cleaning-tabs"
        items={[
          {
            key: 'raw',
            label: '原始数据',
            children: (
              <Table
                size="small"
                rowKey="id"
                dataSource={state.rawData}
                columns={rawColumns}
                pagination={{ pageSize: 5 }}
              />
            ),
          },
          {
            key: 'clean',
            label: '清洗结果',
            children: state.result ? (
              <Table
                size="small"
                rowKey="id"
                dataSource={state.result.cleaned}
                columns={columns}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Text>暂无清洗结果，请先加载示例数据。</Text>
            ),
          },
          {
            key: 'invalid',
            label: '异常数据',
            children: state.result ? (
              <Table
                size="small"
                rowKey="id"
                dataSource={state.result.invalid}
                columns={rawColumns}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Text>暂无异常数据。</Text>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default DataCleaningPanel
