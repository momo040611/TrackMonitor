import React, { useState, useEffect } from 'react'
import {
  Card,
  List,
  Tag,
  Button,
  Progress,
  Statistic,
  Row,
  Col,
  Drawer,
  Typography,
  message,
  Space,
} from 'antd'
import {
  BugOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  RobotOutlined,
  FileTextOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import './AnomalyDiagnosis.less'

const { Title, Paragraph, Text } = Typography

interface Props {
  onDispatch?: (content: string) => void
}

interface DiagnosisItem {
  id: string
  level: 'error' | 'warning' | 'info'
  title: string
  description: string
  suggestion: string
  affected_scope?: string
  score_impact: number
}

export const AnomalyDiagnosis: React.FC<Props> = ({ onDispatch }) => {
  const [analyzing, setAnalyzing] = useState(false)
  const [healthScore, setHealthScore] = useState(100)
  const [issues, setIssues] = useState<DiagnosisItem[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentIssue, setCurrentIssue] = useState<DiagnosisItem | null>(null)

  //处理跳转逻辑
  const handleToDispatch = () => {
    if (!currentIssue || !onDispatch) return

    // 自动组装成一段清晰的任务描述
    const taskContext = `
【异常转工单】${currentIssue.title}
-------------------------
[级别] ${currentIssue.level.toUpperCase()}
[影响范围] ${currentIssue.affected_scope || '未知'}
[异常描述] ${currentIssue.description}
[AI 建议] ${currentIssue.suggestion}
      `.trim()

    onDispatch(taskContext)
    message.loading('正在同步上下文至分派台...', 0.5)
  }

  const startDiagnosis = async () => {
    try {
      setAnalyzing(true)
      setIssues([])
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockIssues: DiagnosisItem[] = [
        {
          id: '1',
          level: 'error',
          title: 'generate_click 事件参数缺失',
          description: '检测到 5% 的生成点击事件缺失 model_type 参数。',
          suggestion: '请检查 TrackSDK 的调用代码，确保 payload 中包含 model_type 字段。',
          affected_scope: 'A/B 测试实验组 B',
          score_impact: 15,
        },
        {
          id: '2',
          level: 'warning',
          title: 'work_show 曝光未去重',
          description: '同一作品 ID 在短时间内触发了多次曝光。',
          suggestion: '建议引入防抖 (Debounce) 机制，或使用 SDK 的 once: true 选项。',
          score_impact: 5,
        },
        {
          id: '3',
          level: 'info',
          title: 'Prompt 长度分布异常',
          description: '检测到超长 Prompt (Length > 1000) 占比上升。',
          suggestion: '业务提示，暂无需代码修复。',
          score_impact: 0,
        },
      ]

      setIssues(mockIssues)
      const totalDeduction = mockIssues.reduce((acc, item) => acc + item.score_impact, 0)
      setHealthScore(Math.max(0, 100 - totalDeduction))
      message.success('诊断完成')
    } catch (error) {
      message.error('诊断失败')
      console.error(error)
    } finally {
      setAnalyzing(false)
    }
  }

  useEffect(() => {
    startDiagnosis()
  }, [])

  const showDetails = (item: DiagnosisItem) => {
    setCurrentIssue(item)
    setDrawerVisible(true)
  }

  return (
    <div className="anomaly-diagnosis-container">
      <Card
        title={
          <>
            <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} /> AI 埋点诊断中心
          </>
        }
        extra={
          <Button
            type="primary"
            ghost
            icon={<ReloadOutlined />}
            loading={analyzing}
            onClick={startDiagnosis}
          >
            重新诊断
          </Button>
        }
        className="diagnosis-card"
      >
        <Row gutter={24} className="score-section">
          <Col span={6} className="score-col">
            <Progress
              type="dashboard"
              percent={healthScore}
              format={(percent) => <span className="score-text">{percent}</span>}
              strokeColor={healthScore > 80 ? '#52c41a' : healthScore > 60 ? '#faad14' : '#ff4d4f'}
              width={100}
            />
            <div className="score-label">健康评分</div>
          </Col>
          <Col span={18}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="已扫描事件数"
                  value={12893}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="发现异常"
                  value={issues.length}
                  valueStyle={{ color: issues.length > 0 ? '#cf1322' : '#3f8600' }}
                  prefix={<BugOutlined />}
                />
              </Col>
            </Row>
            <div className="diagnosis-summary">
              {analyzing ? (
                <span className="loading-text">
                  <ReloadOutlined spin /> AI 正在分析数据模式...
                </span>
              ) : (
                <span>
                  发现 <b>{issues.length}</b> 个潜在异常，扣除 <b>{100 - healthScore}</b> 分。
                </span>
              )}
            </div>
          </Col>
        </Row>

        <List
          className="issue-list"
          loading={analyzing}
          dataSource={issues}
          pagination={{ pageSize: 5, size: 'small', hideOnSinglePage: true }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small" onClick={() => showDetails(item)}>
                  查看详情
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.level === 'error' ? (
                    <BugOutlined className="icon-error" />
                  ) : item.level === 'warning' ? (
                    <WarningOutlined className="icon-warning" />
                  ) : (
                    <RobotOutlined className="icon-info" />
                  )
                }
                title={
                  <div className="issue-title">
                    <Tag
                      color={
                        item.level === 'error'
                          ? 'red'
                          : item.level === 'warning'
                            ? 'orange'
                            : 'blue'
                      }
                    >
                      {item.level.toUpperCase()}
                    </Tag>
                    <Text strong>{item.title}</Text>
                  </div>
                }
                description={
                  <Text type="secondary" ellipsis>
                    {item.description}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Drawer
        title={
          <span>
            <FileTextOutlined /> 异常详情
          </span>
        }
        placement="right"
        width={480}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {currentIssue && (
          // 使用 className 替代内联样式
          <div className="diagnosis-drawer-content">
            <div>
              <Title level={5}>异常描述</Title>
              <Paragraph>{currentIssue.description}</Paragraph>
            </div>

            {currentIssue.affected_scope && (
              <div>
                <Title level={5}>影响范围</Title>
                <Tag color="purple" className="scope-tag">
                  {currentIssue.affected_scope}
                </Tag>
              </div>
            )}

            <Card
              type="inner"
              title={
                <Space>
                  <RobotOutlined /> AI 修复建议
                </Space>
              }
              className="suggestion-card"
              actions={[
                <Button
                  key="dispatch"
                  type="primary"
                  size="small"
                  ghost
                  icon={<ExportOutlined />}
                  onClick={handleToDispatch}
                  disabled={!onDispatch}
                >
                  转人工分派
                </Button>,
              ]}
            >
              <Paragraph style={{ marginBottom: 0 }}>{currentIssue.suggestion}</Paragraph>
            </Card>

            <div className="meta-info">
              异常 ID: {currentIssue.id} | 扣分权重: {currentIssue.score_impact}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
