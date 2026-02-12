import React from 'react'
import { Result, Button, Typography } from 'antd'
import { useNavigate, useRouteError } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'

const { Title } = Typography

interface ErrorPageProps {
  status?: number
  message?: string
}

const ErrorPage: React.FC<ErrorPageProps> = ({ status, message }) => {
  const navigate = useNavigate()
  const error = useRouteError() as any

  const errorStatus = status || error?.status || 500
  const errorMessage = message || error?.message || '服务器内部错误'

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

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
      <Result
        status={errorStatus === 404 ? '404' : 'error'}
        title={errorStatus === 404 ? '404' : errorStatus}
        subTitle={errorStatus === 404 ? '页面不存在' : errorMessage}
        extra={
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button type="default" onClick={handleGoBack}>
              返回
            </Button>
            <Button type="primary" icon={<HomeOutlined />} onClick={handleGoHome}>
              回到首页
            </Button>
          </div>
        }
      />
      {errorStatus !== 404 && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Title level={5}>错误详情</Title>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              maxWidth: '600px',
              wordBreak: 'break-all',
            }}
          >
            {error ? JSON.stringify(error, null, 2) : '未知错误'}
          </div>
        </div>
      )}
    </div>
  )
}

export default ErrorPage
