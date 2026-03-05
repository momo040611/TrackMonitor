import React from 'react'
import { Drawer, Typography, Tag, Card, Button, Space } from 'antd'
import { FileTextOutlined, RobotOutlined, ExportOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface DiagnosisItem {
  id: string
  title: string
  description: string
  level: 'error' | 'warning' | 'info'
  affected_scope?: string
  suggestion: string
  score_impact: number
}

interface IssueDetailDrawerProps {
  visible: boolean
  issue: DiagnosisItem | null
  onClose: () => void
  onDispatch: () => void
  canDispatch: boolean
}

const IssueDetailDrawer: React.FC<IssueDetailDrawerProps> = ({
  visible,
  issue,
  onClose,
  onDispatch,
  canDispatch,
}) => {
  return (
    <Drawer
      title={
        <span>
          <FileTextOutlined /> 异常详情
        </span>
      }
      placement="right"
      size={480}
      onClose={onClose}
      open={visible}
    >
      {issue && (
        <div className="diagnosis-drawer-content">
          <div>
            <Title level={5}>异常描述</Title>
            <Paragraph>{issue.description}</Paragraph>
          </div>
          {issue.affected_scope && (
            <div>
              <Title level={5}>影响范围</Title>
              <Tag color="purple" className="scope-tag">
                {issue.affected_scope}
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
                onClick={onDispatch}
                disabled={!canDispatch}
              >
                转人工分派
              </Button>,
            ]}
          >
            <Paragraph style={{ marginBottom: 0 }}>{issue.suggestion}</Paragraph>
          </Card>
          <div className="meta-info">
            异常 ID: {issue.id} | 扣分权重: {issue.score_impact}
          </div>
        </div>
      )}
    </Drawer>
  )
}

export default IssueDetailDrawer
