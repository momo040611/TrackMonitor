import React from 'react'
import { Form, Input, Button, Space, Table, Popconfirm } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ConfigItem } from '../../services/metadata'

interface ConfigManagerProps {
  data: ConfigItem[]
  onAdd: (item: ConfigItem) => void
  onRemove: (key: string) => void
}

const configColumns: ColumnsType<ConfigItem> = [
  { title: '配置项', dataIndex: 'key', key: 'key' },
  { title: '值', dataIndex: 'value', key: 'value' },
  { title: '说明', dataIndex: 'description', key: 'description' },
]

const ConfigManager: React.FC<ConfigManagerProps> = ({ data, onAdd, onRemove }) => {
  const [form] = Form.useForm<ConfigItem>()

  const handleAdd = (values: ConfigItem) => {
    onAdd(values)
    form.resetFields()
  }

  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      <Form form={form} layout="inline" size="small" onFinish={handleAdd}>
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
        dataSource={data}
        columns={[
          ...configColumns,
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Popconfirm title="确认删除该配置？" onConfirm={() => onRemove(record.key)}>
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

export default ConfigManager
