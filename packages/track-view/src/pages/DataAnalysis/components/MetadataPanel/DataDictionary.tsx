import React from 'react'
import { Form, Input, Switch, Button, Space, Table, Popconfirm, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { DataDictionaryItem } from '../../services/metadata'

interface DataDictionaryProps {
  data: DataDictionaryItem[]
  onAdd: (item: DataDictionaryItem) => void
  onRemove: (field: string) => void
}

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

const DataDictionary: React.FC<DataDictionaryProps> = ({ data, onAdd, onRemove }) => {
  const [form] = Form.useForm<DataDictionaryItem>()

  const handleAdd = (values: DataDictionaryItem) => {
    onAdd(values)
    form.resetFields()
  }

  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      <Form form={form} layout="inline" size="small" onFinish={handleAdd}>
        <Form.Item
          name="field"
          label="字段名"
          rules={[{ required: true, message: '请输入字段名' }]}
        >
          <Input style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{ required: true, message: '请输入类型' }]}>
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
        dataSource={data}
        columns={[
          ...dictColumns,
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Popconfirm title="确认删除该字段？" onConfirm={() => onRemove(record.field)}>
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
  )
}

export default DataDictionary
