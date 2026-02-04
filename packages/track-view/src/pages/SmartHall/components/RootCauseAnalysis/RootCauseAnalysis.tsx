import React, { useState } from 'react'
import { Card, Button, Typography, Tag, Space, Empty } from 'antd'
import { IndentedTree } from '@ant-design/graphs'
import {
  AimOutlined,
  SearchOutlined,
  DeploymentUnitOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import './RootCauseAnalysis.less'

const { Title, Text } = Typography

interface RootCauseResult {
  dimension: string
  value: string
  score: number
  description: string
  type?: 'infrastructure' | 'business' | 'client'
}

export const RootCauseAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RootCauseResult[]>([])

  const handleAnalyze = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockResponse: RootCauseResult[] = [
      {
        dimension: 'app_version',
        value: '2.4.0-beta',
        score: 95,
        type: 'client',
        description: '崩溃率激增，高度聚集于该内测版本',
      },
      {
        dimension: 'db_instance',
        value: 'rm-bp1x9... (主库)',
        score: 88,
        type: 'infrastructure',
        description: 'CPU 使用率持续 99%，导致写入超时',
      },
      {
        dimension: 'api_path',
        value: '/api/v1/user/profile',
        score: 72,
        type: 'business',
        description: '接口 P99 延迟超过 2s',
      },
      {
        dimension: 'api_path',
        value: '/api/v1/order/create',
        score: 68,
        type: 'business',
        description: '下单接口偶发 502 错误',
      },
      {
        dimension: 'region',
        value: '华东-上海',
        score: 45,
        type: 'infrastructure',
        description: '该区域网络抖动（置信度低）',
      },
      {
        dimension: 'os',
        value: 'Android 14',
        score: 42,
        type: 'client',
        description: '特定系统版本兼容性问题',
      },
    ]
    const sortedResults = mockResponse.sort((a, b) => b.score - a.score)
    setResults(sortedResults)
    setLoading(false)
  }

  const dynamicHeight = Math.min(Math.max(results.length * 80, 300), 800)

  // 样式定义
  const cardStyle = {
    fill: '#e6f7ff',
    stroke: '#1890ff',
    radius: 4,
    lineWidth: 1,
    cursor: 'pointer',
  }

  const highRiskStyle = {
    ...cardStyle,
    fill: '#fff1f0',
    stroke: '#ff4d4f',
  }

  return (
    <div className="root-cause-container">
      {/* 左侧：结果列表（增加滚动条） */}
      <Card
        className="analysis-card"
        title={
          <span>
            <AimOutlined /> 根因定位控制台 ({results.length})
          </span>
        }
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={handleAnalyze}
            danger={results.length > 3}
          >
            {results.length > 0 ? '重新诊断' : '开始全链路归因分析'}
          </Button>
        </div>

        <div
          className="result-list"
          style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: 4 }}
        >
          {results.length > 0
            ? results.map((item, index) => (
                <div
                  key={index}
                  className={`suspect-item ${item.score < 60 ? 'low-risk' : ''}`}
                  style={{ opacity: item.score < 60 ? 0.6 : 1 }}
                >
                  <div className="suspect-info">
                    <Space>
                      <Tag color={item.score > 80 ? 'red' : item.score > 60 ? 'orange' : 'default'}>
                        {item.dimension}
                      </Tag>
                      <h4 style={{ margin: 0 }}>{item.value}</h4>
                    </Space>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 60 }}>
                    <span
                      style={{
                        color: item.score > 80 ? '#ff4d4f' : '#faad14',
                        fontWeight: 'bold',
                        fontSize: 16,
                      }}
                    >
                      {item.score}
                    </span>
                    <div style={{ fontSize: 10, color: '#999' }}>分</div>
                  </div>
                </div>
              ))
            : !loading && <Empty description="暂无异常" />}
        </div>
      </Card>
      {/* 右侧：拓扑可视化 */}
      <Card
        className="analysis-card"
        title={
          <span>
            <DeploymentUnitOutlined /> 影响链路拓扑
          </span>
        }
        bodyStyle={{ padding: 0 }}
      >
        {results.length > 0 ? (
          <div style={{ padding: 20 }}>
            {/* 保持高度，确保画布可见 */}
            <div style={{ height: 500, width: '100%' }}>
              <IndentedTree
                data={{
                  id: 'root',
                  // 针对不同的内部实现，同时提供 title, name, label
                  label: `异常总集\n(N=${results.length})`,
                  title: `异常总集\n(N=${results.length})`,
                  name: `异常总集\n(N=${results.length})`,

                  // 强制指定形状和样式
                  type: 'rect',
                  style: { fill: '#333', stroke: '#000', radius: 4 },
                  labelCfg: { style: { fill: '#fff', fontSize: 14, fontWeight: 'bold' } },

                  children: results.map((item, index) => ({
                    id: `node-${index}`,
                    // 同样全字段覆盖
                    label: `${item.dimension}\n${item.value}`,
                    title: `${item.dimension}\n${item.value}`,
                    name: `${item.dimension}\n${item.value}`,

                    // 形状与颜色
                    type: 'rect',
                    style:
                      item.score > 80
                        ? {
                            fill: '#fff1f0',
                            stroke: '#ff4d4f',
                            radius: 4,
                            lineWidth: 1,
                          }
                        : {
                            fill: '#e6f7ff',
                            stroke: '#1890ff',
                            radius: 4,
                            lineWidth: 1,
                          },
                    // 文字样式
                    labelCfg: {
                      style: {
                        fill: item.score > 80 ? '#cf1322' : '#000',
                        fontSize: 12,
                        fontWeight: item.score > 80 ? 'bold' : 'normal',
                      },
                    },
                  })),
                }}
                // 布局与交互
                autoFit="view"
                behaviors={['drag-canvas', 'zoom-canvas', 'drag-node']}
                layout={{
                  type: 'indented',
                  direction: 'LR',
                  dropCap: false,
                  indent: 250, // 增加横向间距
                  getHeight: () => 80, // 增加纵向间距，防止重叠
                  getWidth: () => 220, // 显式给一个宽度提示
                }}
              />
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: '#fff2f0',
                borderRadius: 8,
                border: '1px solid #ffccc7',
              }}
            >
              <Title level={5} type="danger">
                <WarningOutlined /> AI 综合排查结论：
              </Title>
              <Text>
                系统检测到 <b>{results.length}</b> 个异常特征。
                <br />
                核心根因指向 <b>App版本 (2.4.0-beta)</b> 和 <b>数据库 (CPU过高)</b>。
              </Text>
            </div>
          </div>
        ) : (
          <div
            className="chart-area"
            style={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text type="secondary">暂无数据</Text>
          </div>
        )}
      </Card>
    </div>
  )
}
