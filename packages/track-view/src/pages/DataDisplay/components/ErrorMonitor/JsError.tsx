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
}

interface JsErrorProps {
  errorData: ErrorData[]
}

const { Panel } = Collapse
const { Text } = Typography

const JsError: React.FC<JsErrorProps> = ({ errorData }) => {
  // 表格列配置
  const columns: ColumnsType<ErrorData> = [
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      render: (text) => <Text ellipsis>{text}</Text>,
    },
    {
      title: '错误位置',
      dataIndex: 'url',
      key: 'url',
      render: (url, record) => (
        <div>
          <Text ellipsis>{url}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
            行: {record.line}, 列: {record.column}
          </Text>
        </div>
      ),
    },
    {
      title: '发生次数',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Badge count={count} style={{ backgroundColor: '#f5222d' }} />,
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
                <Text strong>错误堆栈:</Text>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 4 }}>
                  {record.stack}
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
      locale={{ emptyText: '暂无 JS 运行异常数据' }}
    />
  )
}

export default JsError
