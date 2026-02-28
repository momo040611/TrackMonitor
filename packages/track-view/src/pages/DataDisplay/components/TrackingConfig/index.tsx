import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { useTrackingData, type TrackingDataItem } from './useTrackingData'
import AddTrackingModal from './AddTrackingModal'

const { Option } = Select
const { TextArea } = Input
const { Item } = Form

const TrackingConfig: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('project1')
  const [timeRange, setTimeRange] = useState<string>('today')
  const [trackingType, setTrackingType] = useState<string>('click')

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 底部编辑区状态
  const [url, setUrl] = useState<string>('')
  const [selectedTrackingType, setSelectedTrackingType] = useState<string>('click')
  const [editForm] = Form.useForm() // 专属于右侧编辑区的独立表单实例
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const {
    trackingData,
    setTrackingData,
    isLoading,
    fetchTrackingData,
    updateTrackingStatus,
    handleDelete,
  } = useTrackingData()

  useEffect(() => {
    fetchTrackingData()
  }, [fetchTrackingData])

  // 批量操作
  const handleBatchPublish = () => {
    if (selectedRowKeys.length === 0) return message.warning('请先选择埋点')
    message.success(`已批量发布 ${selectedRowKeys.length} 个埋点`)
    setTrackingData((prev) =>
      prev.map((item) =>
        selectedRowKeys.includes(item.key)
          ? { ...item, status: 'active', statusText: '已生效', statusIcon: '✅' }
          : item
      )
    )
    setSelectedRowKeys([])
  }

  const handleBatchDisable = () => {
    if (selectedRowKeys.length === 0) return message.warning('请先选择埋点')
    message.success(`已批量失效 ${selectedRowKeys.length} 个埋点`)
    setTrackingData((prev) =>
      prev.map((item) =>
        selectedRowKeys.includes(item.key)
          ? { ...item, status: 'inactive', statusText: '已失效', statusIcon: '❌' }
          : item
      )
    )
    setSelectedRowKeys([])
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return message.warning('请先选择埋点')
    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个埋点吗？`,
      onOk: () => {
        message.success(`已批量删除 ${selectedRowKeys.length} 个埋点`)
        setTrackingData((prev) => prev.filter((item) => !selectedRowKeys.includes(item.key)))
        setSelectedRowKeys([])
      },
    })
  }

  // 导入导出
  const handleImportConfig: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess } = options
    setTimeout(() => {
      message.success('配置导入成功')
      onSuccess?.(file)
    }, 1000)
  }

  const handleExportConfig = () => {
    message.success('配置导出成功')
    const dataStr = JSON.stringify(trackingData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const linkUrl = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = linkUrl
    link.download = 'tracking-config.json'
    link.click()
    URL.revokeObjectURL(linkUrl)
  }

  // 编辑区交互
  const handleEdit = async (record: TrackingDataItem) => {
    try {
      const eventData = await api.getEventById(record.id)
      if (eventData.data) {
        editForm.setFieldsValue(eventData.data)
        message.info(`正在编辑: ${record.name}`)
      }
    } catch (error) {
      // 本地 Mock 测试时直接用表格数据填充
      editForm.setFieldsValue({ name: record.name, trigger: record.trigger })
      message.info(`正在编辑: ${record.name}`)
    }
  }

  // 表格配置
  const columns = useMemo(
    () => [
      {
        title: '埋点 ID',
        dataIndex: 'id',
        key: 'id',
        sorter: (a: TrackingDataItem, b: TrackingDataItem) => a.id.localeCompare(b.id),
      },
      { title: '埋点名称', dataIndex: 'name', key: 'name' },
      { title: '类型', dataIndex: 'type', key: 'type' },
      { title: '所属页面', dataIndex: 'page', key: 'page' },
      { title: '触发条件', dataIndex: 'trigger', key: 'trigger' },
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
                  onClick={() => message.info(`预览埋点: ${record.name}`)}
                >
                  预览
                </Button>
                <Button
                  type="text"
                  icon={<PauseCircleOutlined />}
                  size="small"
                  style={{ color: '#faad14' }}
                  onClick={() => updateTrackingStatus(record, 'inactive', '失效')}
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
                  onClick={() => updateTrackingStatus(record, 'active', '发布')}
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
                  onClick={() => updateTrackingStatus(record, 'active', '恢复')}
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
    ],
    [updateTrackingStatus, handleDelete, editForm]
  )

  return (
    <div>
      {/* 顶部子筛选区 */}
      <Card style={{ marginBottom: '24px', background: '#fff' }}>
        <Row gutter={16} align="middle">
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
                </Select>
              </div>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
                <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
                  <Option value="today">今日</Option>
                  <Option value="7days">近 7 天</Option>
                </Select>
              </div>
              <div>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>埋点类型：</span>
                <Select value={trackingType} onChange={setTrackingType} style={{ width: 160 }}>
                  <Option value="click">点击</Option>
                  <Option value="exposure">曝光</Option>
                </Select>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ marginTop: '16px' }}>
            <Space size="middle" wrap style={{ float: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
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
          minHeight: `calc(100vh - 240px)`,
        }}
      >
        {/* 上半部分：埋点配置列表 */}
        <Card style={{ flex: 0.6, overflow: 'hidden', background: '#fff', minHeight: '300px' }}>
          <div style={{ height: 'calc(100% - 56px)', overflow: 'auto' }}>
            <Table
              loading={isLoading}
              rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
              columns={columns}
              dataSource={trackingData}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 'max-content' }}
            />
          </div>
        </Card>

        {/* 下半部分：可视化埋点编辑器 */}
        <Card
          style={{
            flex: 0.4,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            minHeight: '450px',
          }}
          styles={{ body: { flex: 1, overflow: 'hidden', padding: '24px' } }}
        >
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
                    if (iframeRef.current && url) iframeRef.current.src = url
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
            <Col
              xs={24}
              md={12}
              style={{
                height: '100%',
                overflowY: 'auto',
                paddingRight: '16px',
                paddingBottom: '32px',
              }}
            >
              {' '}
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
              <Form form={editForm} layout="vertical">
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

      {/* 独立的新增埋点模态框组件 */}
      <AddTrackingModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={(values, type) => {
          setIsModalOpen(false)
          message.success('埋点创建成功')
          const newItem: TrackingDataItem = {
            key: `new-${Date.now()}`,
            id: `track-${Date.now()}`,
            name: values.name,
            type: type,
            page: '未知页面',
            trigger: values.trigger || 'click',
            status: 'pending',
            statusText: '待发布',
            statusIcon: '⏳',
          }
          setTrackingData([newItem, ...trackingData])
        }}
      />
    </div>
  )
}

export default TrackingConfig
