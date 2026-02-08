import React, { useReducer } from 'react'
import {
  Card,
  Tabs,
  Table,
  Tag,
  Typography,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Popconfirm,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { metadataInitialState, metadataReducer } from '../../../store/modules/metadata'
import {
  loadInitialMetadata,
  type DataDictionaryItem,
  type TagItem,
  type ConfigItem,
} from '../services/metadata'
import './MetadataPanel.less'

const { Title, Text } = Typography

const dictColumns: ColumnsType<DataDictionaryItem> = [
  { title: '字段名', dataIndex: 'field', key: 'field' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  {
    title: '必填',
    dataIndex: 'required',
    key: 'required',
    render: (value: boolean) => (value ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
  },
  { title: '说明', dataIndex: 'description', key: 'description' },
]

const tagColumns: ColumnsType<TagItem> = [
  { title: '标签名', dataIndex: 'name', key: 'name' },
  { title: '分类', dataIndex: 'category', key: 'category' },
  {
    title: '展示',
    key: 'display',
    render: (_, record) => <Tag color={record.color}>{record.name}</Tag>,
  },
]

const configColumns: ColumnsType<ConfigItem> = [
  { title: '配置项', dataIndex: 'key', key: 'key' },
  { title: '值', dataIndex: 'value', key: 'value' },
  { title: '说明', dataIndex: 'description', key: 'description' },
]

const MetadataPanel: React.FC = () => {
  const [state, dispatch] = useReducer(metadataReducer, metadataInitialState, () => ({
    ...metadataInitialState,
    ...loadInitialMetadata(),
  }))

  const [dictForm] = Form.useForm<DataDictionaryItem>()
  const [tagForm] = Form.useForm<TagItem>()
  const [configForm] = Form.useForm<ConfigItem>()

  const handleAddDictionary = (values: DataDictionaryItem) => {
    dispatch({ type: 'addDictionary', payload: values })
    dictForm.resetFields()
  }

  const handleAddTag = (values: TagItem) => {
    dispatch({ type: 'addTag', payload: values })
    tagForm.resetFields()
  }

  const handleAddConfig = (values: ConfigItem) => {
    dispatch({ type: 'addConfig', payload: values })
    configForm.resetFields()
  }

  return (
    <Card className="metadata-panel">
      <Title level={4}>元数据管理</Title>
      <Text>管理埋点字段、标签和全局配置，为分析提供统一规范。</Text>
      <Tabs
        className="metadata-tabs"
        items={[
          {
            key: 'dictionary',
            label: '数据字典',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form form={dictForm} layout="inline" size="small" onFinish={handleAddDictionary}>
                  <Form.Item
                    name="field"
                    label="字段名"
                    rules={[{ required: true, message: '请输入字段名' }]}
                  >
                    <Input style={{ width: 120 }} />
                  </Form.Item>
                  <Form.Item
                    name="type"
                    label="类型"
                    rules={[{ required: true, message: '请输入类型' }]}
                  >
                    <Input style={{ width: 120 }} />
                  </Form.Item>
                  <Form.Item name="required" label="必填" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Form.Item name="description" label="说明">
                    <Input style={{ width: 220 }} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      新增字段
                    </Button>
                  </Form.Item>
                </Form>
                <Table
                  size="small"
                  rowKey="field"
                  dataSource={state.dictionary}
                  columns={[
                    ...dictColumns,
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, record) => (
                        <Popconfirm
                          title="确认删除该字段？"
                          onConfirm={() =>
                            dispatch({
                              type: 'removeDictionary',
                              payload: record.field,
                            })
                          }
                        >
                          <Button type="link" size="small">
                            删除
                          </Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  pagination={false}
                />
              </Space>
            ),
          },
          {
            key: 'tags',
            label: '标签与分类',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form form={tagForm} layout="inline" size="small" onFinish={handleAddTag}>
                  <Form.Item
                    name="name"
                    label="标签名"
                    rules={[{ required: true, message: '请输入标签名' }]}
                  >
                    <Input style={{ width: 140 }} />
                  </Form.Item>
                  <Form.Item name="category" label="分类">
                    <Input style={{ width: 140 }} />
                  </Form.Item>
                  <Form.Item name="color" label="颜色">
                    <Input style={{ width: 120 }} placeholder="如 green" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      新增标签
                    </Button>
                  </Form.Item>
                </Form>
                <Table
                  size="small"
                  rowKey="name"
                  dataSource={state.tags}
                  columns={[
                    ...tagColumns,
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, record) => (
                        <Popconfirm
                          title="确认删除该标签？"
                          onConfirm={() => dispatch({ type: 'removeTag', payload: record.name })}
                        >
                          <Button type="link" size="small">
                            删除
                          </Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  pagination={false}
                />
              </Space>
            ),
          },
          {
            key: 'config',
            label: '配置项',
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form form={configForm} layout="inline" size="small" onFinish={handleAddConfig}>
                  <Form.Item
                    name="key"
                    label="配置项"
                    rules={[{ required: true, message: '请输入配置项 key' }]}
                  >
                    <Input style={{ width: 160 }} />
                  </Form.Item>
                  <Form.Item name="value" label="值">
                    <Input style={{ width: 160 }} />
                  </Form.Item>
                  <Form.Item name="description" label="说明">
                    <Input style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      新增配置
                    </Button>
                  </Form.Item>
                </Form>
                <Table
                  size="small"
                  rowKey="key"
                  dataSource={state.configs}
                  columns={[
                    ...configColumns,
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, record) => (
                        <Popconfirm
                          title="确认删除该配置？"
                          onConfirm={() =>
                            dispatch({
                              type: 'removeConfig',
                              payload: record.key,
                            })
                          }
                        >
                          <Button type="link" size="small">
                            删除
                          </Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  pagination={false}
                />
              </Space>
            ),
          },
        ]}
      />
    </Card>
  )
}

export default MetadataPanel
