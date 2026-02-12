import React, { useMemo, useReducer, useState } from 'react'
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Form,
  Switch,
  Checkbox,
  Select,
  message,
} from 'antd'
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
import { api } from '../../../api/request'
import './DataCleaningPanel.less'

const { Title, Text } = Typography

interface DataCleaningPanelProps {
  onCleanedChange?: (cleaned: CleanedRecord[]) => void
}

const DataCleaningPanel: React.FC<DataCleaningPanelProps> = ({ onCleanedChange }) => {
  const [state, dispatch] = useReducer(dataCleaningReducer, dataCleaningInitialState)
  const [dataSource, setDataSource] = useState<string>('all')

  const currentRules: CleaningRule = state.rules ?? buildDefaultRules()

  const dataSourceOptions = [
    { value: 'all', label: '所有事件' },
    { value: 'userBehavior', label: '用户行为事件' },
    { value: 'performance', label: '性能事件' },
    { value: 'error', label: '错误事件' },
  ]

  const handleLoadSample = async () => {
    try {
      let result
      const params = { projectId: 'default', timeRange: '24h' }

      switch (dataSource) {
        case 'all':
          result = await api.getAllEvents(params)
          break
        case 'userBehavior':
          result = await api.getUserBehaviorData(params)
          break
        case 'performance':
          result = await api.getPerformanceData(params)
          break
        case 'error':
          result = await api.getErrorData(params)
          break
        default:
          result = await api.getAllEvents(params)
      }

      if (result.data && result.data.code === 200) {
        const sample = result.data.data || []
        // 转换数据格式以适应清洗管道
        const formattedSample = sample.map((item: any, index: number) => ({
          id: item.id || `event-${index}-${Date.now()}`,
          userId: item.userId || item.user_id || `user-${Math.floor(Math.random() * 1000)}`,
          event: item.event || item.type || 'unknown',
          value: item.value || item.duration || item.count || 0,
          timestamp: item.timestamp || Date.now(),
        }))

        dispatch({ type: 'setRawData', payload: formattedSample })
        dispatch({ type: 'setRules', payload: currentRules })
        const cleaningResult = applyCleaningPipeline(formattedSample, currentRules)
        dispatch({ type: 'setCleaningResult', payload: cleaningResult })
        if (onCleanedChange) {
          onCleanedChange(cleaningResult.cleaned)
        }

        message.success(`成功加载 ${formattedSample.length} 条数据`)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败，请检查网络连接')
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
      <Space className="data-cleaning-header" direction="vertical" size="small">
        <Title level={4}>数据清洗</Title>
        <Text>对原始埋点数据进行验证、去重、过滤和标准化，为后续聚合分析做准备。</Text>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space size="middle">
            <Select
              value={dataSource}
              onChange={setDataSource}
              options={dataSourceOptions}
              style={{ width: 200 }}
              placeholder="选择数据源"
            />
            <Button type="primary" onClick={handleLoadSample}>
              加载数据并执行清洗
            </Button>
          </Space>
          {state.result && (
            <Space size="small">
              <Tag color="blue">原始: {state.rawData.length}</Tag>
              <Tag color="green">清洗后: {state.result.cleaned.length}</Tag>
              <Tag color="red">异常: {state.result.invalid.length}</Tag>
            </Space>
          )}
        </Space>
        <Card size="small" className="data-cleaning-rules" bordered>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
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
