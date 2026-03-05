import React from 'react'
import { Card, Avatar, Table, Tag, Button, Statistic, Progress, Empty } from 'antd'
import { TeamOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons'

import type { Developer } from './useTaskDispatch'
import { SCORING } from './useTaskDispatch'

interface RecommendationResultProps {
  candidates: Developer[]
  analyzedTags: string[]
  onAssign: (name: string) => void
}

const RecommendationResult: React.FC<RecommendationResultProps> = ({
  candidates,
  analyzedTags,
  onAssign,
}) => {
  return (
    <Card
      title={
        <span>
          <TeamOutlined /> 推荐引擎结果
        </span>
      }
      className="result-card"
      variant="borderless"
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
                <h2 className="dev-name">{candidates[0].name}</h2>
                <div className="dev-role">{candidates[0].role}</div>
              </div>
              <div className="score-stat">
                <Statistic
                  title="匹配置信度"
                  value={candidates[0].matchScore}
                  suffix="%"
                  styles={{ content: { color: '#52c41a' } }}
                />
              </div>
            </div>
            <div className="reason-box">
              <ThunderboltOutlined style={{ color: '#faad14' }} />
              <b> 推荐理由：</b>
              {candidates[0].reason}
            </div>
            <Button type="primary" block onClick={() => onAssign(candidates[0].name)}>
              一键指派
            </Button>
          </div>

          {/* 其他备选 */}
          <div className="others-title">其他备选</div>
          <Table
            dataSource={candidates.slice(1)}
            rowKey="name"
            pagination={false}
            columns={[
              {
                title: '开发者信息',
                key: 'info',
                render: (_, item) => (
                  <div>
                    <div className="dev-info-row">
                      <Avatar src={item.avatar} style={{ marginRight: 8 }} />
                      <span>{item.name}</span>
                      <span
                        className={
                          item.matchScore > SCORING.MATCH_THRESHOLD_HIGH
                            ? 'match-score-high'
                            : 'match-score-low'
                        }
                      >
                        匹配度 {item.matchScore}%
                      </span>
                    </div>
                    <div className="dev-meta">
                      <span>当前负载: </span>
                      <Progress
                        className="load-progress"
                        percent={item.currentLoad}
                        size="small"
                        steps={5}
                        strokeColor={
                          item.currentLoad > SCORING.HIGH_LOAD_THRESHOLD ? '#ff4d4f' : '#1890ff'
                        }
                      />
                    </div>
                  </div>
                ),
              },
              {
                title: '操作',
                key: 'action',
                render: (_, item) => (
                  <Button size="small" onClick={() => onAssign(item.name)}>
                    指派
                  </Button>
                ),
              },
            ]}
          />
        </div>
      ) : (
        <Empty
          className="empty-result"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无分析结果，请在左侧输入任务"
        />
      )}
    </Card>
  )
}

export default RecommendationResult
