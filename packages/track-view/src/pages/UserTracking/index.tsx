import React, { useMemo } from 'react'
import { Card, Button, Table, Statistic, Row, Col, Spin, Tag } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, ClearOutlined } from '@ant-design/icons'
import { useUserTracking } from './useUserTracking'
import {
  WebTracking,
  MiniProgramTracking,
  NodeJSTracking,
  ElectronTracking,
} from './components/PlatformTrackers'

const PLATFORM_MAP: Record<string, string> = {
  web: '网页',
  'mini-program': '小程序',
  nodejs: 'Node.js',
  electron: 'Electron',
}

const UserTracking: React.FC = () => {
  const {
    trackingData,
    setTrackingData,
    activePlatform,
    setActivePlatform,
    isTracking,
    isLoading,
    trackerRef,
    startTracking,
    stopTracking,
    addTrackingData,
  } = useUserTracking()

  const columns = useMemo(
    () => [
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (text: string) => (
          <Tag color="blue" style={{ borderRadius: 12 }}>
            {text}
          </Tag>
        ),
      },
      {
        title: '时间戳',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (text: number) => new Date(text).toLocaleString(),
      },
      {
        title: '平台',
        dataIndex: 'platform',
        key: 'platform',
        render: (text: string) => (
          <Tag color="green" style={{ borderRadius: 12 }}>
            {PLATFORM_MAP[text] || text}
          </Tag>
        ),
      },
      { title: '详情', dataIndex: 'details', key: 'details' },
    ],
    []
  )

  const renderActiveTracker = () => {
    const props = { isTracking, addData: addTrackingData, trackerRef }
    switch (activePlatform) {
      case 'web':
        return <WebTracking {...props} />
      case 'mini-program':
        return <MiniProgramTracking {...props} />
      case 'nodejs':
        return <NodeJSTracking {...props} />
      case 'electron':
        return <ElectronTracking {...props} />
      default:
        return null
    }
  }

  return (
    <div className="pageContent">
      <h2 className="pageTitle">用户行为追踪</h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
        用户行为追踪页面，用于追踪和分析用户在不同平台上的行为数据。
      </p>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={8}>
            <Button
              type="primary"
              style={{ marginRight: 8 }}
              icon={isTracking ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={isTracking ? stopTracking : startTracking}
            >
              {isTracking ? '停止追踪' : '开始追踪'}
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={() => setTrackingData([])}
              disabled={!isTracking}
            >
              清空数据
            </Button>
          </Col>
          <Col span={16}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic title="当前平台" value={PLATFORM_MAP[activePlatform]} />
              </Col>
              <Col span={6}>
                <Statistic title="事件数量" value={trackingData.length} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="追踪状态"
                  value={isTracking ? '活跃' : '非活跃'}
                  valueStyle={{ color: isTracking ? '#52c41a' : '#faad14' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.entries(PLATFORM_MAP).map(([key, label]) => (
            <Button
              key={key}
              type={activePlatform === key ? 'primary' : 'default'}
              onClick={() => setActivePlatform(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="平台追踪详情">{renderActiveTracker()}</Card>
          </Col>
          <Col span={24}>
            <Card title="追踪事件" styles={{ body: { maxHeight: '400px', overflowY: 'auto' } }}>
              <Table dataSource={trackingData} columns={columns} rowKey="key" pagination={false} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default UserTracking
