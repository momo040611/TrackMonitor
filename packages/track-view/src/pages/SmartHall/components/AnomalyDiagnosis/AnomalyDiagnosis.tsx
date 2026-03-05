import React, { useMemo } from 'react'
import { Card, Table, Tag, Button, Progress, Statistic, Row, Col, Typography, message } from 'antd'
import { BugOutlined, CheckCircleOutlined, ReloadOutlined, RobotOutlined } from '@ant-design/icons'
import { useAnomalyDiagnosis } from './useAnomalyDiagnosis'
import { useSmartHall } from '../../hooks/useSmartHall'
import type { DiagnosisItem } from '../../types'
import IssueDetailDrawer from './IssueDetailDrawer'
import './AnomalyDiagnosis.less'

const { Text } = Typography

export const AnomalyDiagnosis: React.FC = () => {
  const { goToDispatch } = useSmartHall()
  const {
    analyzing,
    healthScore,
    issues,
    drawerVisible,
    currentIssue,
    startDiagnosis,
    showDetails,
    closeDrawer,
  } = useAnomalyDiagnosis()

  //缓存 Table 列配置
  const columns = useMemo(
    () => [
      {
        title: '异常信息',
        key: 'info',
        render: (_: unknown, item: DiagnosisItem) => (
          <div>
            <div className="issue-title">
              <Tag
                color={
                  item.level === 'error' ? 'red' : item.level === 'warning' ? 'orange' : 'blue'
                }
              >
                {item.level.toUpperCase()}
              </Tag>
              <Text strong>{item.title}</Text>
            </div>
            <Text type="secondary" ellipsis>
              {item.description}
            </Text>
          </div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        render: (_: unknown, item: DiagnosisItem) => (
          <Button type="link" size="small" onClick={() => showDetails(item)}>
            查看详情
          </Button>
        ),
      },
    ],
    [showDetails]
  )

  // 业务派发逻辑 - 使用 Context
  const handleToDispatch = () => {
    if (!currentIssue) return
    const taskContext =
      `【异常转工单】${currentIssue.title}\n-------------------------\n[级别] ${currentIssue.level.toUpperCase()}\n[影响范围] ${currentIssue.affected_scope || '未知'}\n[异常描述] ${currentIssue.description}\n[AI 建议] ${currentIssue.suggestion}`.trim()
    goToDispatch(taskContext)
    message.loading('正在同步上下文至分派台...', 0.5)
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
            onClick={() => startDiagnosis(true)}
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
              size={100}
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
                  styles={{ content: { color: issues.length > 0 ? '#cf1322' : '#3f8600' } }}
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

        <Table
          className="issue-list"
          loading={analyzing}
          dataSource={issues}
          pagination={{ pageSize: 5, size: 'small', hideOnSinglePage: true }}
          rowKey="id"
          columns={columns}
        />
      </Card>

      <IssueDetailDrawer
        visible={drawerVisible}
        issue={currentIssue}
        onClose={closeDrawer}
        onDispatch={handleToDispatch}
        canDispatch={true}
      />
    </div>
  )
}
