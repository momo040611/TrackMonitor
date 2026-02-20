import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Select,
  Space,
  Button,
  Table,
  Input,
  Form,
  Radio,
  Tooltip,
  message,
  Modal,
  Upload,
} from 'antd'
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { api } from '../../../../api/request'

const { Option } = Select
const { TextArea } = Input
const { Item } = Form

interface TrackingDataItem {
  key: string
  id: string
  name: string
  type: string
  page: string
  trigger: string
  status: 'active' | 'pending' | 'inactive'
  statusText: string
  statusIcon: string
}

const TrackingConfig: React.FC = () => {
  // 状态管理
  const [selectedProject, setSelectedProject] = useState<string>('project1')
  const [timeRange, setTimeRange] = useState<string>('today')
  const [trackingType, setTrackingType] = useState<string>('click')
  const [selectedTrackingType, setSelectedTrackingType] = useState<string>('click')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [url, setUrl] = useState<string>('')
  const [form] = Form.useForm()
  const [trackingData, setTrackingData] = useState<TrackingDataItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Ref
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 处理函数
  // 新增埋点
  const handleAddTracking = () => {
    setIsModalOpen(true)
  }

  // 批量发布
  const handleBatchPublish = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择埋点')
      return
    }
    message.success(`已批量发布 ${selectedRowKeys.length} 个埋点`)
    // 模拟更新数据
    const updatedData = trackingData.map((item) => {
      if (selectedRowKeys.includes(item.key)) {
        return { ...item, status: 'active' as const, statusText: '已生效', statusIcon: '✅' }
      }
      return item
    })
    setTrackingData(updatedData)
    setSelectedRowKeys([])
  }

  // 批量失效
  const handleBatchDisable = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择埋点')
      return
    }
    message.success(`已批量失效 ${selectedRowKeys.length} 个埋点`)
    // 模拟更新数据
    const updatedData = trackingData.map((item) => {
      if (selectedRowKeys.includes(item.key)) {
        return { ...item, status: 'inactive' as const, statusText: '已失效', statusIcon: '❌' }
      }
      return item
    })
    setTrackingData(updatedData)
    setSelectedRowKeys([])
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择埋点')
      return
    }
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个埋点吗？`,
      onOk: () => {
        message.success(`已批量删除 ${selectedRowKeys.length} 个埋点`)
        // 模拟更新数据
        const updatedData = trackingData.filter((item) => !selectedRowKeys.includes(item.key))
        setTrackingData(updatedData)
        setSelectedRowKeys([])
      },
    })
  }

  // 导入配置
  const handleImportConfig: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    try {
      // 模拟导入过程
      setTimeout(() => {
        message.success('配置导入成功')
        onSuccess?.(file)
      }, 1000)
    } catch (error) {
      message.error('配置导入失败')
      onError?.(error as any, file)
    }
  }

  // 导出配置
  const handleExportConfig = () => {
    message.success('配置导出成功')
    // 模拟导出过程
    const dataStr = JSON.stringify(trackingData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tracking-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // 处理表格行操作
  const handleEdit = async (record: TrackingDataItem) => {
    try {
      const eventData = await api.getEventById(record.id)
      if (eventData.data) {
        // 填充表单数据
        form.setFieldsValue({
          name: eventData.data.name,
          event: eventData.data.event,
          frequency: eventData.data.frequency,
          properties: eventData.data.properties,
          trigger: eventData.data.trigger,
          stayTime: eventData.data.stayTime,
          remark: eventData.data.remark,
        })
        setIsModalOpen(true)
      }
    } catch (error) {
      message.error('编辑埋点失败')
    }
  }

  const handlePreview = async (record: TrackingDataItem) => {
    try {
      const eventData = await api.getEventById(record.id)
      if (eventData.data) {
        message.info(
          `预览埋点: ${record.name}\n类型: ${eventData.data.type}\n触发条件: ${eventData.data.trigger}`
        )
      }
    } catch (error) {
      message.error('预览埋点失败')
    }
  }

  const handleDisable = async (record: TrackingDataItem) => {
    try {
      const result = await api.updateEvent({ id: record.id, status: 'inactive' })
      if (result.status === 0 || result.status === 200) {
        message.success(`已失效埋点: ${record.name}`)
        const updatedData = trackingData.map((item) => {
          if (item.key === record.key) {
            return { ...item, status: 'inactive' as const, statusText: '已失效', statusIcon: '❌' }
          }
          return item
        })
        setTrackingData(updatedData)
      }
    } catch (error) {
      message.error('失效埋点失败')
    }
  }

  const handlePublish = async (record: TrackingDataItem) => {
    try {
      const result = await api.updateEvent({ id: record.id, status: 'active' })
      if (result.status === 0 || result.status === 200) {
        message.success(`已发布埋点: ${record.name}`)
        const updatedData = trackingData.map((item) => {
          if (item.key === record.key) {
            return { ...item, status: 'active' as const, statusText: '已生效', statusIcon: '✅' }
          }
          return item
        })
        setTrackingData(updatedData)
      }
    } catch (error) {
      message.error('发布埋点失败')
    }
  }

  const handleDelete = async (record: TrackingDataItem) => {
    Modal.confirm({
      title: '删除埋点',
      content: `确定要删除埋点 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const result = await api.deleteEvent(record.id)
          if (result.status === 0 || result.status === 200) {
            message.success(`已删除埋点: ${record.name}`)
            const updatedData = trackingData.filter((item) => item.key !== record.key)
            setTrackingData(updatedData)
          }
        } catch (error) {
          message.error('删除埋点失败')
        }
      },
    })
  }

  const handleRecover = async (record: TrackingDataItem) => {
    try {
      const result = await api.updateEvent({ id: record.id, status: 'active' })
      if (result.status === 0 || result.status === 200) {
        message.success(`已恢复埋点: ${record.name}`)
        const updatedData = trackingData.map((item) => {
          if (item.key === record.key) {
            return { ...item, status: 'active' as const, statusText: '已生效', statusIcon: '✅' }
          }
          return item
        })
        setTrackingData(updatedData)
      }
    } catch (error) {
      message.error('恢复埋点失败')
    }
  }

  // 获取埋点配置数据
  const fetchTrackingData = async () => {
    setIsLoading(true)
    try {
      const result = await api.getAllEvents()
      if (result.data) {
        const data = Array.isArray(result.data) ? result.data : []
        setTrackingData(
          data.map((item: any) => ({
            key: item.id || `key-${Date.now()}-${Math.random()}`,
            id: item.id || `track-${Date.now()}-${Math.random()}`,
            name: item.name || '未命名埋点',
            type: item.type || 'click',
            page: item.page || '未知页面',
            trigger: item.trigger || 'click',
            status: item.status || 'pending',
            statusText:
              item.status === 'active'
                ? '已生效'
                : item.status === 'inactive'
                  ? '已失效'
                  : '待发布',
            statusIcon: item.status === 'active' ? '✅' : item.status === 'inactive' ? '❌' : '⏳',
          }))
        )
      } else {
        setTrackingData([])
      }
    } catch (error) {
      setTrackingData([])
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    fetchTrackingData()
  }, [])

  // 表格列配置
  const columns = [
    {
      title: '埋点 ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: TrackingDataItem, b: TrackingDataItem) => a.id.localeCompare(b.id),
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
      render: (status: string, record: TrackingDataItem) => (
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
      render: (_: any, record: TrackingDataItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'active' && (
            <>
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handlePreview(record)}
              >
                预览
              </Button>
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                size="small"
                style={{ color: '#faad14' }}
                onClick={() => handleDisable(record)}
              >
                失效
              </Button>
            </>
          )}
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handlePublish(record)}
              >
                发布
              </Button>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{ color: '#f5222d' }}
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </>
          )}
          {record.status === 'inactive' && (
            <>
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleRecover(record)}
              >
                恢复
              </Button>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                style={{ color: '#f5222d' }}
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys)
    },
  }

  return (
    <div>
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
                  <Option value="project1">项目1</Option>
                  <Option value="project2">项目2</Option>
                  <Option value="project3">项目3</Option>
                </Select>
              </div>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
                <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
                  <Option value="today">今日</Option>
                  <Option value="7days">近 7 天</Option>
                  <Option value="30days">近 30 天</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </div>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点类型：</span>
                <Select value={trackingType} onChange={setTrackingType} style={{ width: 160 }}>
                  <Option value="click">点击</Option>
                  <Option value="exposure">曝光</Option>
                  <Option value="stay">停留</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </div>
            </Space>
          </Col>

          {/* 快捷操作 */}
          <Col xs={24} md={8} style={{ marginTop: '16px' }}>
            <Space size="middle" wrap style={{ float: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTracking}>
                新增埋点
              </Button>
              <Button onClick={handleBatchPublish}>批量发布</Button>
              <Button onClick={handleBatchDisable}>批量失效</Button>
              <Button danger onClick={handleBatchDelete}>
                批量删除
              </Button>
              <Tooltip title="导入配置">
                <Upload customRequest={handleImportConfig} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>导入配置</Button>
                </Upload>
              </Tooltip>
              <Tooltip title="导出配置">
                <Button icon={<DownloadOutlined />} onClick={handleExportConfig}>
                  导出配置
                </Button>
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
              loading={isLoading}
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
                  src={url || undefined}
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
                    <Option value="event1">事件1</Option>
                    <Option value="event2">事件2</Option>
                    <Option value="event3">事件3</Option>
                  </Select>
                </Item>

                <Item label="上报频率" name="frequency">
                  <Select style={{ width: '100%' }}>
                    <Option value="realtime">实时</Option>
                    <Option value="batch">批量</Option>
                  </Select>
                </Item>

                <Item label="自定义属性" name="properties">
                  <TextArea rows={3} placeholder="请输入自定义属性" />
                </Item>

                <Item label="触发条件" name="trigger">
                  <Select style={{ width: '100%' }}>
                    <Option value="click">点击</Option>
                    <Option value="exposure">曝光</Option>
                    <Option value="stay">停留时长≥X 秒</Option>
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

      {/* 新增埋点模态框 */}
      <Modal
        title="新增埋点"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.validateFields().then((values) => {
                message.success('埋点创建成功')
                setIsModalOpen(false)
                form.resetFields()
                // 模拟添加新数据
                const newItem: TrackingDataItem = {
                  key: `new-${Date.now()}`,
                  id: `track-${Date.now()}`,
                  name: values.name || `埋点-${Date.now()}`,
                  type: selectedTrackingType,
                  page: url || '未知页面',
                  trigger: values.trigger || 'click',
                  status: 'pending' as const,
                  statusText: '待发布',
                  statusIcon: '⏳',
                }
                setTrackingData([...trackingData, newItem])
              })
            }}
          >
            提交
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="埋点名称"
            name="name"
            rules={[{ required: true, message: '请输入埋点名称' }]}
          >
            <Input placeholder="请输入埋点名称" />
          </Form.Item>

          <Form.Item label="埋点类型">
            <Radio.Group
              value={selectedTrackingType}
              onChange={(e) => setSelectedTrackingType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="click">点击</Radio.Button>
              <Radio.Button value="exposure">曝光</Radio.Button>
              <Radio.Button value="stay">停留</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="所属事件" name="event">
            <Select style={{ width: '100%' }}>
              <Option value="event1">事件1</Option>
              <Option value="event2">事件2</Option>
              <Option value="event3">事件3</Option>
            </Select>
          </Form.Item>

          <Form.Item label="上报频率" name="frequency">
            <Select style={{ width: '100%' }}>
              <Option value="realtime">实时</Option>
              <Option value="batch">批量</Option>
            </Select>
          </Form.Item>

          <Form.Item label="自定义属性" name="properties">
            <TextArea rows={3} placeholder="请输入自定义属性" />
          </Form.Item>

          <Form.Item label="触发条件" name="trigger">
            <Select style={{ width: '100%' }}>
              <Option value="click">点击</Option>
              <Option value="exposure">曝光</Option>
              <Option value="stay">停留时长≥X 秒</Option>
            </Select>
          </Form.Item>

          {selectedTrackingType === 'stay' && (
            <Form.Item label="停留时长" name="stayTime">
              <Input type="number" placeholder="请输入停留时长（秒）" style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TrackingConfig
