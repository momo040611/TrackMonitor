import React, { useState } from 'react'
import {
  Card,
  Input,
  Button,
  Avatar,
  List,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
  Badge,
  message,
  Tooltip,
  Empty,
  Radio,
} from 'antd'
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  BarChartOutlined,
  CheckCircleFilled,
  FireOutlined,
  ThunderboltOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import './SmartDispatch.less'

const { TextArea } = Input

// 定义开发者模型
interface Developer {
  id: string
  name: string
  role: string
  avatar: string
  skills: string[]
  currentLoad: number // 当前负载
  matchScore: number // 本次匹配度
  reason: string // 推荐理由
}

// 模拟开发者池
const MOCK_DEVS: Developer[] = [
  {
    id: 'u1',
    name: 'Jason (前端)',
    role: 'Senior Frontend',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jason',
    skills: ['React', 'TypeScript', 'Visualization'],
    currentLoad: 85,
    matchScore: 0,
    reason: '',
  },
  {
    id: 'u2',
    name: 'Alice (后端)',
    role: 'Backend Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    skills: ['Java', 'Spring', 'Redis'],
    currentLoad: 40,
    matchScore: 0,
    reason: '',
  },
  {
    id: 'u3',
    name: 'David (移动端)',
    role: 'iOS Expert',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    skills: ['Swift', 'Objective-C', 'Crashlytics'],
    currentLoad: 20,
    matchScore: 0,
    reason: '',
  },
]

export const SmartDispatch: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [taskDesc, setTaskDesc] = useState('')
  const [candidates, setCandidates] = useState<Developer[]>([])
  const [analyzedTags, setAnalyzedTags] = useState<string[]>([])

  // 模拟 AI 分派逻辑
  const handleDispatch = () => {
    if (!taskDesc.trim()) return message.warning('请输入任务描述')

    setLoading(true)
    setCandidates([])
    setAnalyzedTags([])

    setTimeout(() => {
      // 1. 简单的关键词提取模拟
      const tags: string[] = []
      if (taskDesc.toLowerCase().includes('ios') || taskDesc.includes('崩溃'))
        tags.push('Client', 'Crash')
      else if (taskDesc.toLowerCase().includes('java') || taskDesc.includes('超时'))
        tags.push('Server', 'Performance')
      else tags.push('Frontend', 'UI')

      setAnalyzedTags(tags)

      // 2. 模拟打分逻辑
      const scoredDevs = MOCK_DEVS.map((dev) => {
        let score = 50 // 基础分
        let reason = '技能栈部分匹配'

        // 简单的规则匹配
        if (tags.includes('Crash') && dev.skills.includes('Swift')) {
          score += 40
          reason = '擅长处理客户端崩溃问题'
        } else if (tags.includes('Performance') && dev.skills.includes('Java')) {
          score += 40
          reason = '后端性能优化专家'
        } else if (tags.includes('UI') && dev.skills.includes('React')) {
          score += 45
          reason = '负责该 UI 模块'
        }

        // 负载惩罚
        if (dev.currentLoad > 80) {
          score -= 10
          reason += ' (但当前负载较高)'
        }

        return { ...dev, matchScore: score }
      }).sort((a, b) => b.matchScore - a.matchScore)

      setCandidates(scoredDevs)
      setLoading(false)
      message.success('智能分派分析完成')
    }, 1500)
  }

  const handleAssign = (name: string) => {
    message.success(`任务已自动创建 Jira 工单并指派给 ${name}`)
  }

  return (
    <div className="smart-dispatch-container">
      <Row gutter={24} style={{ height: '100%' }}>
        {/* 左侧：任务录入 */}
        <Col span={10} style={{ height: '100%' }}>
          <Card
            title={
              <span>
                <SendOutlined /> 任务录入
              </span>
            }
            className="input-card"
            bordered={false}
          >
            <div className="input-wrapper">
              <p style={{ color: '#666', marginBottom: 12 }}>
                请输入 Bug 描述、报警日志或需求概览，AI 将自动分析技术栈与人员负载。
              </p>
              <TextArea
                rows={10}
                placeholder="例如：用户在 iOS 16.0 系统下进入个人中心发生闪退，日志显示 NullPointerException..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                style={{ marginBottom: 20, resize: 'none' }}
              />

              {/* 快捷填入模拟 */}
              <div className="quick-tags">
                <Tag onClick={() => setTaskDesc('首页加载速度超过 3s，API 响应慢')}>#性能优化</Tag>
                <Tag onClick={() => setTaskDesc('iOS 支付回调失败，订单状态未更新')}>#支付Bug</Tag>
                <Tag onClick={() => setTaskDesc('调整登录页按钮颜色为品牌蓝')}>#UI调整</Tag>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<RobotOutlined />}
                block
                onClick={handleDispatch}
                loading={loading}
                style={{ marginTop: 'auto' }}
              >
                {loading ? 'AI 正在匹配最佳人选...' : '开始智能分派'}
              </Button>
            </div>
          </Card>
        </Col>

        {/* 右侧：推荐结果 */}
        <Col span={14} style={{ height: '100%' }}>
          <Card
            title={
              <span>
                <TeamOutlined /> 推荐引擎结果
              </span>
            }
            className="result-card"
            bordered={false}
            extra={
              analyzedTags.length > 0 && (
                <span>
                  识别标签：
                  {analyzedTags.map((t) => (
                    <Tag color="blue" key={t}>
                      {t}
                    </Tag>
                  ))}
                </span>
              )
            }
          >
            {candidates.length > 0 ? (
              <div className="candidates-list">
                {/* 最佳匹配展示 */}
                <div className="best-match">
                  <div className="match-badge">
                    <FireOutlined /> Best Match
                  </div>
                  <div className="best-info">
                    <Avatar size={64} src={candidates[0].avatar} />
                    <div className="info-text">
                      <h2 style={{ margin: 0 }}>{candidates[0].name}</h2>
                      <div style={{ color: '#666' }}>{candidates[0].role}</div>
                    </div>
                    <div className="score-stat">
                      <Statistic
                        title="匹配置信度"
                        value={candidates[0].matchScore}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </div>
                  </div>
                  <div className="reason-box">
                    <ThunderboltOutlined style={{ color: '#faad14' }} />
                    <b> 推荐理由：</b>
                    {candidates[0].reason}
                  </div>
                  <Button type="primary" block onClick={() => handleAssign(candidates[0].name)}>
                    一键指派
                  </Button>
                </div>

                {/* 其他备选 */}
                <div className="others-title">其他备选</div>
                <List
                  itemLayout="horizontal"
                  dataSource={candidates.slice(1)}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button size="small" onClick={() => handleAssign(item.name)}>
                          指派
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.name}</span>
                            <span style={{ color: item.matchScore > 60 ? '#1890ff' : '#999' }}>
                              匹配度 {item.matchScore}%
                            </span>
                          </div>
                        }
                        description={
                          <div className="dev-meta">
                            <span>当前负载: </span>
                            <Progress
                              percent={item.currentLoad}
                              size="small"
                              steps={5}
                              strokeColor={item.currentLoad > 80 ? '#ff4d4f' : '#1890ff'}
                              style={{ width: 100 }}
                            />
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无分析结果，请在左侧输入任务"
                style={{ marginTop: 100 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
