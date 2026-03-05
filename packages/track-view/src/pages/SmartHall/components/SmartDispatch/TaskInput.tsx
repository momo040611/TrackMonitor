import React from 'react'
import { Card, Input, Button, Tag } from 'antd'
import { SendOutlined, RobotOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface TaskInputProps {
  taskDesc: string
  setTaskDesc: (desc: string) => void
  loading: boolean
  onDispatch: () => void
}

const TaskInput: React.FC<TaskInputProps> = ({ taskDesc, setTaskDesc, loading, onDispatch }) => {
  return (
    <Card
      title={
        <span>
          <SendOutlined /> 任务录入
        </span>
      }
      className="input-card"
      variant="outlined"
    >
      <div className="input-wrapper">
        <p className="instruction-text">
          请输入 Bug 描述、报警日志或需求概览，AI 将自动分析技术栈与人员负载。
        </p>
        <TextArea
          className="task-textarea"
          rows={10}
          placeholder="例如：用户在 iOS 16.0 系统下进入个人中心发生闪退，日志显示 NullPointerException..."
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
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
          onClick={onDispatch}
          loading={loading}
          className="dispatch-btn"
        >
          {loading ? 'AI 正在匹配最佳人选...' : '开始智能分派'}
        </Button>
      </div>
    </Card>
  )
}

export default TaskInput
