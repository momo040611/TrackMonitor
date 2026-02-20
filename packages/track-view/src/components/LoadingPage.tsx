import React from 'react'
import { Spin, Typography, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface LoadingPageProps {
  message?: string
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = '加载中...' }) => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Space orientation="vertical" size="middle" style={{ textAlign: 'center' }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />}
          size="large"
        />
        <Title level={4}>{message}</Title>
        <Text type="secondary">请稍候，数据正在加载中...</Text>
      </Space>
    </div>
  )
}

export default LoadingPage
