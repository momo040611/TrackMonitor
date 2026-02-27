import React, { useState } from 'react'
import { Modal, Form, Input, Select, Radio, Button, message } from 'antd'

const { Option } = Select
const { TextArea } = Input

// 定义组件接收的 Props
interface AddTrackingModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: (values: any, trackingType: string) => void
}

const AddTrackingModal: React.FC<AddTrackingModalProps> = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm()
  const [selectedTrackingType, setSelectedTrackingType] = useState<string>('click')

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // 把成功的数据抛给父组件处理
        onSuccess(values, selectedTrackingType)
        form.resetFields() // 提交后清空当前表单
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="新增埋点"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          提交
        </Button>,
      ]}
    >
      {/* 独立的 Form 绑定 */}
      <Form form={form} layout="vertical">
        <Form.Item
          label="埋点名称"
          name="name"
          rules={[{ required: true, message: '请输入埋点名称' }]}
        >
          <Input placeholder="请输入埋点名称" />
        </Form.Item>

        <Form.Item label="埋点类型">
          <Radio.Group
            value={selectedTrackingType}
            onChange={(e) => setSelectedTrackingType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="click">点击</Radio.Button>
            <Radio.Button value="exposure">曝光</Radio.Button>
            <Radio.Button value="stay">停留</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="所属事件" name="event">
          <Select style={{ width: '100%' }}>
            <Option value="event1">事件1</Option>
            <Option value="event2">事件2</Option>
            <Option value="event3">事件3</Option>
          </Select>
        </Form.Item>

        <Form.Item label="上报频率" name="frequency">
          <Select style={{ width: '100%' }}>
            <Option value="realtime">实时</Option>
            <Option value="batch">批量</Option>
          </Select>
        </Form.Item>

        <Form.Item label="自定义属性" name="properties">
          <TextArea rows={3} placeholder="请输入自定义属性" />
        </Form.Item>

        <Form.Item label="触发条件" name="trigger">
          <Select style={{ width: '100%' }}>
            <Option value="click">点击</Option>
            <Option value="exposure">曝光</Option>
            <Option value="stay">停留时长≥X 秒</Option>
          </Select>
        </Form.Item>

        {selectedTrackingType === 'stay' && (
          <Form.Item label="停留时长" name="stayTime">
            <Input type="number" placeholder="请输入停留时长（秒）" style={{ width: '100%' }} />
          </Form.Item>
        )}

        <Form.Item label="备注" name="remark">
          <TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddTrackingModal
