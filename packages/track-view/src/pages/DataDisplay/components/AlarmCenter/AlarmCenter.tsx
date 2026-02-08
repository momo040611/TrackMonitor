import { useState, useRef, useEffect } from 'react'
import { Card, Row, Col, Select, Space, Button, Table, Badge, Spin, message, Tag } from 'antd'
import {
  BellOutlined,
  BellFilled,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'

// 导入 API 接口
import { api } from '../../../../api/request'

const AlarmCenter = () => {
  // 状态管理
  const [selectedProject, setSelectedProject] = useState('project1')
  const [alarmStatus, setAlarmStatus] = useState('all')
  const [alarmLevel, setAlarmLevel] = useState('all')
  const [alarmType, setAlarmType] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // API 数据状态
  const [alarmData, setAlarmData] = useState([])
  const [alarmStatistics, setAlarmStatistics] = useState({
    total: 0,
    unread: 0,
    high: 0,
    medium: 0,
    low: 0,
  })

  // Ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 数据获取函数
  const fetchAlarmData = async () => {
    try {
      setIsLoading(true)

      // 获取告警数据
      const alarmRes = await api.getAlarmData({
        projectId: selectedProject,
        status: alarmStatus,
        level: alarmLevel,
        type: alarmType,
      })

      setAlarmData(alarmRes.data?.alarms || [])
      setAlarmStatistics(
        alarmRes.data?.statistics || {
          total: 0,
          unread: 0,
          high: 0,
          medium: 0,
          low: 0,
        }
      )

      setUnreadCount(alarmRes.data?.statistics?.unread || 0)
    } catch (error) {
      console.error('获取告警数据失败:', error)
      message.error('获取告警数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 标记告警为已读
  const markAsRead = async (alarmId: string) => {
    try {
      await api.markAlarmAsRead(alarmId)
      message.success('已标记为已读')
      // 重新获取数据
      fetchAlarmData()
    } catch (error) {
      console.error('标记告警失败:', error)
      message.error('标记告警失败，请稍后重试')
    }
  }

  // 处理告警
  const handleAlarm = async (alarmId: string, action: string) => {
    try {
      await api.handleAlarm(alarmId, { action })
      message.success('操作成功')
      // 重新获取数据
      fetchAlarmData()
    } catch (error) {
      console.error('处理告警失败:', error)
      message.error('处理告警失败，请稍后重试')
    }
  }

  // 初始化加载和参数变化时获取数据
  useEffect(() => {
    fetchAlarmData()
  }, [selectedProject, alarmStatus, alarmLevel, alarmType])

  // 定时刷新数据
  useEffect(() => {
    // 每 30 秒刷新一次数据
    intervalRef.current = setInterval(() => {
      fetchAlarmData()
    }, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [selectedProject, alarmStatus, alarmLevel, alarmType])

  // 表格列配置
  const columns = [
    {
      title: '告警 ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '告警类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag
          color={
            type === 'click'
              ? '#1890ff'
              : type === 'exposure'
                ? '#52c41a'
                : type === 'stay'
                  ? '#faad14'
                  : type === 'custom'
                    ? '#f5222d'
                    : '#999'
          }
        >
          {type === 'click'
            ? '点击'
            : type === 'exposure'
              ? '曝光'
              : type === 'stay'
                ? '停留'
                : type === 'custom'
                  ? '自定义'
                  : type}
        </Tag>
      ),
    },
    {
      title: '告警级别',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={level === 'high' ? '#f5222d' : level === 'medium' ? '#faad14' : '#1890ff'}>
          {level === 'high' ? '高' : level === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '告警时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '告警描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'unread' ? '#1890ff' : status === 'read' ? '#52c41a' : '#999'}>
          {status === 'unread' ? '未读' : status === 'read' ? '已读' : '已处理'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: { id: string; status: string }) => (
        <Space size="small">
          {record.status === 'unread' && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              size="small"
              onClick={() => markAsRead(record.id)}
            >
              标记已读
            </Button>
          )}
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            size="small"
            onClick={() => handleAlarm(record.id, 'close')}
          >
            关闭
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      {/* 顶部筛选 */}
      <Card style={{ marginBottom: '24px', background: '#fff' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={16}>
            <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>状态：</span>
                <Select value={alarmStatus} onChange={setAlarmStatus} style={{ width: 120 }}>
                  <Select.Option value="all">全部</Select.Option>
                  <Select.Option value="unread">未读</Select.Option>
                  <Select.Option value="read">已读</Select.Option>
                  <Select.Option value="closed">已关闭</Select.Option>
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>级别：</span>
                <Select value={alarmLevel} onChange={setAlarmLevel} style={{ width: 120 }}>
                  <Select.Option value="all">全部</Select.Option>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                </Select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontWeight: 500 }}>类型：</span>
                <Select value={alarmType} onChange={setAlarmType} style={{ width: 120 }}>
                  <Select.Option value="all">全部</Select.Option>
                  <Select.Option value="click">点击</Select.Option>
                  <Select.Option value="exposure">曝光</Select.Option>
                  <Select.Option value="stay">停留</Select.Option>
                  <Select.Option value="custom">自定义</Select.Option>
                </Select>
              </div>
              <Button type="primary" icon={<ReloadOutlined />} onClick={fetchAlarmData}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ marginTop: '16px' }}>
            <Space size="small" style={{ float: 'right' }}>
              <Button icon={<FilterOutlined />} size="small">
                高级筛选
              </Button>
              <Button icon={<DownloadOutlined />} size="small">
                导出告警
              </Button>
              <Button icon={<SettingOutlined />} size="small">
                告警设置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 告警统计 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginBottom: '8px', fontSize: 16, fontWeight: 600 }}>总告警</h3>
                <p style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                  {alarmStatistics.total}
                </p>
              </div>
              <BellOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginBottom: '8px', fontSize: 16, fontWeight: 600 }}>未读告警</h3>
                <p style={{ fontSize: 24, fontWeight: 600, color: '#f5222d' }}>
                  <Badge count={alarmStatistics.unread} size="small" offset={[0, 0]} />
                  {alarmStatistics.unread}
                </p>
              </div>
              <BellFilled style={{ fontSize: 32, color: '#f5222d' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginBottom: '8px', fontSize: 16, fontWeight: 600 }}>高优先级</h3>
                <p style={{ fontSize: 24, fontWeight: 600, color: '#f5222d' }}>
                  {alarmStatistics.high}
                </p>
              </div>
              <ExclamationCircleOutlined style={{ fontSize: 32, color: '#f5222d' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ marginBottom: '8px', fontSize: 16, fontWeight: 600 }}>中优先级</h3>
                <p style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>
                  {alarmStatistics.medium}
                </p>
              </div>
              <BellOutlined style={{ fontSize: 32, color: '#faad14' }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 核心内容区 */}
      <Spin spinning={isLoading} tip="加载告警数据...">
        <Card
          title="告警列表"
          style={{ background: '#fff' }}
          extra={
            <Badge count={unreadCount} showZero>
              <Button icon={<BellOutlined />} size="small" />
            </Badge>
          }
        >
          <Table
            columns={columns}
            dataSource={alarmData}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Card>
      </Spin>
    </>
  )
}

export default AlarmCenter
