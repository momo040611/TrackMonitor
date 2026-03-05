import React from 'react'
import { Form, Input, Button, Space, Table, Popconfirm, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TagItem } from '../../services/metadata'

interface TagsManagerProps {
  data: TagItem[]
  onAdd: (item: TagItem) => void
  onRemove: (name: string) => void
}

const tagColumns: ColumnsType<TagItem> = [
  { title: '标签名', dataIndex: 'name', key: 'name' },
  { title: '分类', dataIndex: 'category', key: 'category' },
  {
    title: '展示',
    key: 'display',
    render: (_, record) => <Tag color={record.color}>{record.name}</Tag>,
  },
]

const TagsManager: React.FC<TagsManagerProps> = ({ data, onAdd, onRemove }) => {
  const [form] = Form.useForm<TagItem>()

  const handleAdd = (values: TagItem) => {
    onAdd(values)
    form.resetFields()
  }

  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      <Form form={form} layout="inline" size="small" onFinish={handleAdd}>
        <Form.Item name="name" label="标签名" rules={[{ required: true, message: '请输入标签名' }]}>
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
        dataSource={data}
        columns={[
          ...tagColumns,
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Popconfirm title="确认删除该标签？" onConfirm={() => onRemove(record.name)}>
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

export default TagsManager
