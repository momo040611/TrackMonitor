import React, { useState, useRef, useEffect } from 'react'
import type { Key } from 'antd/lib/table/interface'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Radio,
  Space,
  Button,
  Table,
  Input,
  Form,
  Tooltip,
  Popconfirm,
  message,
} from 'antd'
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'

// 导入 API 接口
import { api } from '../../../../api/request'

const { TextArea } = Input
const { Item } = Form

const TrackingConfig = () => {
  // 状态管理
  const [selectedProject, setSelectedProject] = useState('project1')
  const [timeRange, setTimeRange] = useState('today')
  const [trackingType, setTrackingType] = useState('click')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [url, setUrl] = useState('')
  const [selectedTrackingType, setSelectedTrackingType] = useState('click')
  const [isLoading, setIsLoading] = useState(true)
  const [form] = Form.useForm()

  // API 数据状态
  const [trackingData, setTrackingData] = useState<
    {
      id: string
      name: string
      type: string
      page: string
      trigger: string
      status: string
      statusIcon: React.ReactNode
      statusText: string
    }[]
  >([])

  // Ref
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // 数据获取函数
  const fetchData = async () => {
    try {
      setIsLoading(true)

      // 获取埋点列表数据
      const trackingListRes = await api.getTrackingList({
        projectId: selectedProject,
        type: trackingType,
      })
      setTrackingData(trackingListRes.data || [])
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 表格列配置
  const columns = [
    {
      title: '埋点 ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id),
    },
    {
      title: '埋点名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '所属页面',
      dataIndex: 'page',
      key: 'page',
    },
    {
      title: '触发条件',
      dataIndex: 'trigger',
      key: 'trigger',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: { statusIcon: React.ReactNode; statusText: string }) => (
        <span
          style={{
            color: status === 'active' ? '#52c41a' : status === 'pending' ? '#faad14' : '#f5222d',
          }}
        >
          {record.statusIcon} {record.statusText}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: { status: string; id: string }) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          {record.status === 'active' && (
            <>
              <Button type="text" icon={<EyeOutlined />} size="small">
                预览
              </Button>
              <Popconfirm title="确定要失效吗？" onConfirm={() => {}}>
                <Button
                  type="text"
                  icon={<PauseCircleOutlined />}
                  size="small"
                  style={{ color: '#faad14' }}
                >
                  失效
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
              >
                发布
              </Button>
              <Popconfirm title="确定要删除吗？" onConfirm={() => {}}>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ color: '#f5222d' }}
                >
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'inactive' && (
            <>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
              >
                恢复
              </Button>
              <Popconfirm title="确定要删除吗？" onConfirm={() => {}}>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ color: '#f5222d' }}
                >
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: Key[]) => {
      setSelectedRowKeys(selectedRowKeys)
    },
  }

  // 初始化加载和参数变化时获取数据
  useEffect(() => {
    fetchData()
  }, [selectedProject, trackingType])

  return (
    <>
      {/* 顶部子筛选区 */}
      <Card style={{ marginBottom: '24px', background: '#fff' }}>
        <Row gutter={16} align="middle">
          {/* 全局筛选 */}
          <Col xs={24} md={16}>
            <Space size="middle" wrap>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>项目：</span>
                <Select
                  value={selectedProject}
                  onChange={setSelectedProject}
                  style={{ width: 160 }}
                >
                  <Select.Option value="project1">项目1</Select.Option>
                  <Select.Option value="project2">项目2</Select.Option>
                  <Select.Option value="project3">项目3</Select.Option>
                </Select>
              </div>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
                <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
                  <Select.Option value="today">今日</Select.Option>
                  <Select.Option value="7days">近 7 天</Select.Option>
                  <Select.Option value="30days">近 30 天</Select.Option>
                  <Select.Option value="custom">自定义</Select.Option>
                </Select>
                {timeRange === 'custom' && (
                  <DatePicker.RangePicker
                    onChange={(dates) => console.log('自定义日期范围:', dates)}
                    style={{ marginLeft: '8px' }}
                  />
                )}
              </div>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点类型：</span>
                <Select value={trackingType} onChange={setTrackingType} style={{ width: 160 }}>
                  <Select.Option value="click">点击</Select.Option>
                  <Select.Option value="exposure">曝光</Select.Option>
                  <Select.Option value="stay">停留</Select.Option>
                  <Select.Option value="custom">自定义</Select.Option>
                </Select>
              </div>
            </Space>
          </Col>

          {/* 快捷操作 */}
          <Col xs={24} md={8} style={{ marginTop: '16px' }}>
            <Space size="middle" wrap style={{ float: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />}>
                新增埋点
              </Button>
              <Button>批量发布</Button>
              <Button>批量失效</Button>
              <Button danger>批量删除</Button>
              <Tooltip title="导入配置">
                <Button icon={<UploadOutlined />}>导入配置</Button>
              </Tooltip>
              <Tooltip title="导出配置">
                <Button icon={<DownloadOutlined />}>导出配置</Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心内容区 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: `calc(100vh - 240px)`,
        }}
      >
        {/* 上半部分：埋点配置列表 */}
        <Card style={{ flex: 0.6, overflow: 'hidden', background: '#fff' }}>
          <div style={{ height: 'calc(100% - 56px)', overflow: 'auto' }}>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={trackingData}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 'max-content' }}
            />
          </div>
        </Card>

        {/* 下半部分：可视化埋点编辑器 */}
        <Card style={{ flex: 0.4, overflow: 'hidden', background: '#fff' }}>
          <Row gutter={16} style={{ height: '100%' }}>
            {/* 页面预览区 */}
            <Col
              xs={24}
              md={12}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>URL：</span>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ width: 200, marginRight: '8px' }}
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    if (iframeRef.current && url) {
                      iframeRef.current.src = url
                    }
                  }}
                >
                  加载
                </Button>
                <Button
                  size="small"
                  style={{ marginLeft: '8px' }}
                  onClick={() => {
                    if (iframeRef.current) {
                      iframeRef.current.contentWindow?.location.reload()
                    }
                  }}
                >
                  刷新
                </Button>
              </div>
              <div
                style={{
                  flex: 1,
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={undefined}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="页面预览"
                />
              </div>
            </Col>

            {/* 配置表单区 */}
            <Col xs={24} md={12} style={{ height: '100%', overflow: 'auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点类型：</span>
                <Radio.Group
                  value={selectedTrackingType}
                  onChange={(e) => setSelectedTrackingType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="click">点击</Radio.Button>
                  <Radio.Button value="exposure">曝光</Radio.Button>
                  <Radio.Button value="stay">停留</Radio.Button>
                </Radio.Group>
              </div>

              <Form form={form} layout="vertical">
                <Item
                  label="埋点名称"
                  name="name"
                  rules={[{ required: true, message: '请输入埋点名称' }]}
                >
                  <Input placeholder="请输入埋点名称" />
                </Item>

                <Item label="所属事件" name="event">
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="event1">事件1</Select.Option>
                    <Select.Option value="event2">事件2</Select.Option>
                    <Select.Option value="event3">事件3</Select.Option>
                  </Select>
                </Item>

                <Item label="上报频率" name="frequency">
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="realtime">实时</Select.Option>
                    <Select.Option value="batch">批量</Select.Option>
                  </Select>
                </Item>

                <Item label="自定义属性" name="properties">
                  <TextArea rows={3} placeholder="请输入自定义属性" />
                </Item>

                <Item label="触发条件" name="trigger">
                  <Select style={{ width: '100%' }}>
                    <Select.Option value="click">点击</Select.Option>
                    <Select.Option value="exposure">曝光</Select.Option>
                    <Select.Option value="stay">停留时长≥X 秒</Select.Option>
                  </Select>
                </Item>

                {selectedTrackingType === 'stay' && (
                  <Item label="停留时长" name="stayTime">
                    <Input
                      type="number"
                      placeholder="请输入停留时长（秒）"
                      style={{ width: '100%' }}
                    />
                  </Item>
                )}

                <Item label="备注" name="remark">
                  <TextArea rows={3} placeholder="请输入备注信息" />
                </Item>

                <Space size="middle" style={{ marginTop: '16px' }}>
                  <Button>保存草稿</Button>
                  <Button type="primary">预览效果</Button>
                  <Button type="primary" danger>
                    提交发布
                  </Button>
                </Space>
              </Form>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  )
}

export default TrackingConfig
