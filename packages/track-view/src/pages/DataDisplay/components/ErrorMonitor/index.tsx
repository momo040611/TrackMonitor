import React, { useState, useEffect } from 'react'
import { Card, Tabs, Table, Button, Tag, Space, Spin, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import JsError from './JsError'
import PromiseError from './PromiseError'
import StaticResourceError from './StaticResourceError'
import HttpError from './HttpError'
import { api } from '../../../../api/request'

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

const ErrorMonitor: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<string>('js')
  const [errorData, setErrorData] = useState<ErrorData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // 获取错误数据
  const fetchErrorData = async () => {
    setIsLoading(true)
    try {
      const data = await api.getErrorData()
      setErrorData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('获取错误数据失败:', error)
      setErrorData([])
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化加载数据
  useEffect(() => {
    fetchErrorData()
  }, [])

  // 标签页配置
  const tabs = [
    {
      key: 'js',
      label: (
        <Badge count={errorData.filter((item) => item.type === 'js').length}>
          <span>JS 运行异常</span>
        </Badge>
      ),
      children: <JsError errorData={errorData.filter((item) => item.type === 'js')} />,
    },
    {
      key: 'promise',
      label: (
        <Badge count={errorData.filter((item) => item.type === 'promise').length}>
          <span>Promise 异常</span>
        </Badge>
      ),
      children: <PromiseError errorData={errorData.filter((item) => item.type === 'promise')} />,
    },
    {
      key: 'resource',
      label: (
        <Badge count={errorData.filter((item) => item.type === 'resource').length}>
          <span>静态资源加载异常</span>
        </Badge>
      ),
      children: (
        <StaticResourceError errorData={errorData.filter((item) => item.type === 'resource')} />
      ),
    },
    {
      key: 'http',
      label: (
        <Badge count={errorData.filter((item) => item.type === 'http').length}>
          <span>HTTP 请求异常</span>
        </Badge>
      ),
      children: <HttpError errorData={errorData.filter((item) => item.type === 'http')} />,
    },
  ]

  return (
    <Card title="错误监控" variant="outlined" style={{ background: '#fff' }}>
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={tabs} />
    </Card>
  )
}

export default ErrorMonitor
