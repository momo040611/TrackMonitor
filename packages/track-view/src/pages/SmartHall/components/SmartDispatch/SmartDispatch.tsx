import React from 'react'
import { Row, Col } from 'antd'
import TaskInput from './TaskInput'
import RecommendationResult from './RecommendationResult'
import { useTaskDispatch } from './useTaskDispatch'
import './SmartDispatch.less'

export const SmartDispatch: React.FC = () => {
  const { loading, taskDesc, setTaskDesc, candidates, analyzedTags, handleDispatch, handleAssign } =
    useTaskDispatch()

  return (
    <div className="smart-dispatch-container">
      <Row gutter={24} style={{ height: '100%' }}>
        {/* 左侧：任务录入 */}
        <Col span={10} style={{ height: '100%' }}>
          <TaskInput
            taskDesc={taskDesc}
            setTaskDesc={setTaskDesc}
            loading={loading}
            onDispatch={handleDispatch}
          />
        </Col>

        {/* 右侧：推荐结果 */}
        <Col span={14} style={{ height: '100%' }}>
          <RecommendationResult
            candidates={candidates}
            analyzedTags={analyzedTags}
            onAssign={handleAssign}
          />
        </Col>
      </Row>
    </div>
  )
}
