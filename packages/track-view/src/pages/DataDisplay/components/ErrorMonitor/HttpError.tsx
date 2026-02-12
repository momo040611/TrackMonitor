import React from 'react'
import { Table, Tag, Space, Typography, Collapse, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface ErrorData {
  id: string
  type: string
  message: string
  url: string
  line: number
  column: number
  stack: string
  timestamp: string
  count: number
  status?: number
  method?: string
}

interface HttpErrorProps {
  errorData: ErrorData[]
}

const { Panel } = Collapse
const { Text } = Typography

const HttpError: React.FC<HttpErrorProps> = ({ errorData }) => {
  // 表格列配置
  const columns: ColumnsType<ErrorData> = [
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      render: (method) => (
        <Tag color={method === 'GET' ? 'green' : method === 'POST' ? 'blue' : 'orange'}>
          {method}
        </Tag>
      ),
    },
    {
      title: '请求 URL',
      dataIndex: 'url',
      key: 'url',
      render: (url) => <Text ellipsis>{url}</Text>,
    },
    {
      title: '状态码',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          count={status}
          style={{
            backgroundColor: status >= 500 ? '#f5222d' : status >= 400 ? '#faad14' : '#52c41a',
          }}
        />
      ),
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      render: (text) => <Text ellipsis>{text}</Text>,
    },
    {
      title: '发生次数',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#722ed1' }} />,
    },
    {
      title: '发生时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Collapse>
          <Panel header="查看详情" key="1">
            <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>错误详情:</Text>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 4 }}>
                  {record.stack || record.message}
                </pre>
              </div>
            </div>
          </Panel>
        </Collapse>
      ),
    },
  ]

  return (
    <Table
      dataSource={errorData}
      columns={columns}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: '暂无 HTTP 请求异常数据' }}
    />
  )
}

export default HttpError
