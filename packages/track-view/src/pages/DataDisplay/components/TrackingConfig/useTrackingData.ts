import { useState, useCallback } from 'react'
import { message, Modal } from 'antd'
import { api } from '../../../../api/request'

export interface TrackingDataItem {
  key: string
  id: string
  name: string
  type: string
  page: string
  trigger: string
  status: 'active' | 'pending' | 'inactive'
  statusText: string
  statusIcon: string
}

export const useTrackingData = () => {
  const [trackingData, setTrackingData] = useState<TrackingDataItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  //  获取列表数据
  const fetchTrackingData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getAllEvents()
      if (result.data) {
        const data = Array.isArray(result.data) ? result.data : []
        setTrackingData(
          data.map((item: any) => ({
            key: item.id || `key-${Date.now()}-${Math.random()}`,
            id: item.id || `track-${Date.now()}-${Math.random()}`,
            name: item.name || '未命名埋点',
            type: item.type || 'click',
            page: item.page || '未知页面',
            trigger: item.trigger || 'click',
            status: item.status || 'pending',
            statusText:
              item.status === 'active'
                ? '已生效'
                : item.status === 'inactive'
                  ? '已失效'
                  : '待发布',
            statusIcon: item.status === 'active' ? '✅' : item.status === 'inactive' ? '❌' : '⏳',
          }))
        )
      } else {
        setTrackingData([])
      }
    } catch (error) {
      setTrackingData([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 通用的状态更新方法
  const updateTrackingStatus = async (
    record: TrackingDataItem,
    targetStatus: 'active' | 'inactive',
    actionName: string
  ) => {
    try {
      const result = await api.updateEvent({ id: record.id, status: targetStatus })
      if (result.status === 0 || result.status === 200) {
        message.success(`已${actionName}埋点: ${record.name}`)
        setTrackingData((prev) =>
          prev.map((item) =>
            item.key === record.key
              ? {
                  ...item,
                  status: targetStatus,
                  statusText: targetStatus === 'active' ? '已生效' : '已失效',
                  statusIcon: targetStatus === 'active' ? '✅' : '❌',
                }
              : item
          )
        )
      }
    } catch (error) {
      message.error(`${actionName}埋点失败`)
    }
  }

  // 删除操作
  const handleDelete = async (record: TrackingDataItem) => {
    Modal.confirm({
      title: '删除埋点',
      content: `确定要删除埋点 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const result = await api.deleteEvent(record.id)
          if (result.status === 0 || result.status === 200) {
            message.success(`已删除埋点: ${record.name}`)
            setTrackingData((prev) => prev.filter((item) => item.key !== record.key))
          }
        } catch (error) {
          message.error('删除埋点失败')
        }
      },
    })
  }

  return {
    trackingData,
    setTrackingData,
    isLoading,
    fetchTrackingData,
    updateTrackingStatus,
    handleDelete,
  }
}
