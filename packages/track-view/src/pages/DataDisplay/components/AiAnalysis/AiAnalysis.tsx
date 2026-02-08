import { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Space, Button, Table, Input, Spin, message, Alert } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SendOutlined,
} from '@ant-design/icons'

// 导入 API 接口
import { api } from '../../../../api/request'

const { TextArea } = Input

const AiAnalysis = () => {
  // 状态管理
  const [selectedProject, setSelectedProject] = useState('project1')
  const [analysisType, setAnalysisType] = useState('trend')
  const [timeRange, setTimeRange] = useState('7days')
  const [isLoading, setIsLoading] = useState(true)
  const [aiResponse, setAiResponse] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // API 数据状态
  const [analysisData, setAnalysisData] = useState({
    trends: [],
    anomalies: [],
    predictions: [],
    recommendations: [],
  })
  // 数据获取函数
  const fetchAnalysisData = async () => {
    try {
      setIsLoading(true)

      // 获取 AI 分析数据
      const analysisRes = await api.getAiAnalysisData({
        projectId: selectedProject,
        analysisType,
        timeRange,
      })

      setAnalysisData(
        analysisRes.data || {
          trends: [],
          anomalies: [],
          predictions: [],
          recommendations: [],
        }
      )
    } catch (error) {
      console.error('获取分析数据失败:', error)
      message.error('获取分析数据失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 发送 AI 查询
  const sendAiQuery = async () => {
    if (!userQuery.trim()) {
      message.warning('请输入查询内容')
      return
    }

    try {
      setIsAnalyzing(true)

      // 发送 AI 查询
      const aiRes = await api.sendAiQuery({
        projectId: selectedProject,
        query: userQuery,
      })

      setAiResponse(aiRes.data?.response || '')
    } catch (error) {
      console.error('发送 AI 查询失败:', error)
      message.error('发送 AI 查询失败，请稍后重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 初始化加载和参数变化时获取数据
  useEffect(() => {
    fetchAnalysisData()
  }, [selectedProject, analysisType, timeRange])

  // 表格列配置
  const anomalyColumns = [
    {
      title: '异常 ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '异常类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '发生时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <span
          style={{
            color: severity === 'high' ? '#f5222d' : severity === 'medium' ? '#faad14' : '#1890ff',
          }}
        >
          {severity === 'high' ? '高' : severity === 'medium' ? '中' : '低'}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="text" size="small">
          查看详情
        </Button>
      ),
    },
  ]

  const recommendationColumns = [
    {
      title: '建议 ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '建议类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <span
          style={{
            color: priority === 'high' ? '#52c41a' : priority === 'medium' ? '#faad14' : '#1890ff',
          }}
        >
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </span>
      ),
    },
    {
      title: '建议内容',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '预期效果',
      dataIndex: 'expectedEffect',
      key: 'expectedEffect',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="text" size="small">
          应用建议
        </Button>
      ),
    },
  ]

  return (
    <>
      {/* 顶部筛选 */}
      <Card style={{ marginBottom: '24px', background: '#fff' }}>
        <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>项目：</span>
            <Select value={selectedProject} onChange={setSelectedProject} style={{ width: 160 }}>
              <Select.Option value="project1">项目1</Select.Option>
              <Select.Option value="project2">项目2</Select.Option>
              <Select.Option value="project3">项目3</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>分析类型：</span>
            <Select value={analysisType} onChange={setAnalysisType} style={{ width: 160 }}>
              <Select.Option value="trend">趋势分析</Select.Option>
              <Select.Option value="anomaly">异常检测</Select.Option>
              <Select.Option value="prediction">预测分析</Select.Option>
              <Select.Option value="recommendation">优化建议</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', fontWeight: 500 }}>时间范围：</span>
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 160 }}>
              <Select.Option value="7days">近 7 天</Select.Option>
              <Select.Option value="30days">近 30 天</Select.Option>
              <Select.Option value="90days">近 90 天</Select.Option>
            </Select>
          </div>
          <Button type="primary" icon={<ReloadOutlined />} onClick={fetchAnalysisData}>
            刷新数据
          </Button>
        </Space>
      </Card>

      {/* 核心内容区 */}
      <Row gutter={16}>
        {/* 左侧：AI 分析结果 */}
        <Col xs={24} lg={16}>
          <Spin spinning={isLoading} tip="AI 分析中...">
            <Card
              title="AI 分析结果"
              style={{ marginBottom: '16px', background: '#fff' }}
              extra={
                <Space size="small">
                  <Button icon={<DownloadOutlined />} size="small">
                    导出报告
                  </Button>
                  <Button icon={<UploadOutlined />} size="small">
                    上传数据
                  </Button>
                </Space>
              }
            >
              {/* 异常检测结果 */}
              {analysisType === 'anomaly' && (
                <>
                  <Alert
                    message="异常检测"
                    description="系统检测到以下异常情况"
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                  <Table
                    columns={anomalyColumns}
                    dataSource={analysisData.anomalies}
                    pagination={{ pageSize: 5 }}
                  />
                </>
              )}

              {/* 优化建议结果 */}
              {analysisType === 'recommendation' && (
                <>
                  <Alert
                    message="优化建议"
                    description="基于数据分析的优化建议"
                    type="success"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                  <Table
                    columns={recommendationColumns}
                    dataSource={analysisData.recommendations}
                    pagination={{ pageSize: 5 }}
                  />
                </>
              )}

              {/* 趋势分析结果 */}
              {analysisType === 'trend' && (
                <>
                  <Alert
                    message="趋势分析"
                    description="埋点数据趋势分析结果"
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                  <div
                    style={{
                      height: 300,
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BarChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    <span style={{ marginLeft: '16px', fontSize: 16, color: '#666' }}>
                      趋势分析图表
                    </span>
                  </div>
                </>
              )}

              {/* 预测分析结果 */}
              {analysisType === 'prediction' && (
                <>
                  <Alert
                    message="预测分析"
                    description="基于历史数据的预测结果"
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                  />
                  <div
                    style={{
                      height: 300,
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    <span style={{ marginLeft: '16px', fontSize: 16, color: '#666' }}>
                      预测分析图表
                    </span>
                  </div>
                </>
              )}
            </Card>
          </Spin>
        </Col>

        {/* 右侧：AI 对话 */}
        <Col xs={24} lg={8}>
          <Card title="AI 分析助手" style={{ height: '100%', background: '#fff' }}>
            <div style={{ height: 'calc(100% - 120px)', overflow: 'auto', marginBottom: '16px' }}>
              {aiResponse ? (
                <div
                  style={{
                    backgroundColor: '#f0f0f0',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 style={{ marginBottom: '8px', color: '#333' }}>AI 助手</h4>
                  <p style={{ color: '#666' }}>{aiResponse}</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <PieChartOutlined style={{ fontSize: 48, marginBottom: '16px' }} />
                  <p>输入问题，获取 AI 分析结果</p>
                </div>
              )}
            </div>
            <div>
              <TextArea
                rows={4}
                placeholder="例如：分析最近 7 天的埋点数据趋势，找出异常情况"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendAiQuery}
                loading={isAnalyzing}
                style={{ width: '100%' }}
              >
                {isAnalyzing ? '分析中...' : '发送查询'}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default AiAnalysis
