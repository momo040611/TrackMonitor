import React, { useReducer, useEffect, useRef } from 'react'
import { Card, Tabs, Typography } from 'antd'
import { metadataInitialState, metadataReducer } from '../../../store/modules/metadata'
import type { DataDictionaryItem, TagItem, ConfigItem } from '../services/metadata'
import DataDictionary from './MetadataPanel/DataDictionary'
import TagsManager from './MetadataPanel/TagsManager'
import ConfigManager from './MetadataPanel/ConfigManager'
import './MetadataPanel.less'

const { Title, Text } = Typography

const MetadataPanel: React.FC = () => {
  const [state, dispatch] = useReducer(metadataReducer, metadataInitialState)
  const hasLoadedRef = useRef(false)

  // 加载初始元数据
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    const loadMetadata = async () => {
      try {
        const response = await fetch('/api/analysis/metadata')
        // 检查响应是否成功 (200-299) 且为 JSON
        if (!response.ok) {
          // HTTP 错误状态 (如 404, 500 等)，使用默认数据
          setDefaultMetadata()
          return
        }
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json()
          if (result.code === 200) {
            dispatch({ type: 'setAll', payload: result.data })
          } else {
            // 设置默认元数据
            setDefaultMetadata()
          }
        } else {
          // 设置默认元数据
          setDefaultMetadata()
        }
      } catch {
        // 静默处理错误，不在控制台显示
        // 这样即使后端服务不可用，也不会在控制台出现错误信息
        // 设置默认元数据
        setDefaultMetadata()
      }
    }

    // 设置默认元数据的函数
    const setDefaultMetadata = () => {
      dispatch({
        type: 'setAll',
        payload: {
          dictionary: [
            { field: 'eventName', type: 'string', required: true, description: '事件名称' },
            { field: 'timestamp', type: 'number', required: true, description: '事件时间戳' },
            { field: 'userId', type: 'string', required: false, description: '用户ID' },
            { field: 'deviceId', type: 'string', required: false, description: '设备ID' },
            { field: 'platform', type: 'string', required: false, description: '平台类型' },
            { field: 'browser', type: 'string', required: false, description: '浏览器类型' },
            { field: 'screenWidth', type: 'number', required: false, description: '屏幕宽度' },
            { field: 'screenHeight', type: 'number', required: false, description: '屏幕高度' },
          ],
          tags: [
            { name: '用户行为', category: '行为', color: 'blue' },
            { name: '系统错误', category: '错误', color: 'red' },
            { name: '性能问题', category: '性能', color: 'orange' },
            { name: '业务操作', category: '业务', color: 'green' },
            { name: '页面访问', category: '访问', color: 'purple' },
          ],
          configs: [
            { key: 'maxEventSize', value: '1024', description: '最大事件大小(字节)' },
            { key: 'batchInterval', value: '1000', description: '批量上报间隔(毫秒)' },
            { key: 'sampleRate', value: '1', description: '采样率(0-1)' },
            { key: 'enableCompression', value: 'true', description: '启用压缩' },
          ],
        },
      })
    }

    loadMetadata()
  }, [])

  const handleAddDictionary = (values: DataDictionaryItem) => {
    dispatch({ type: 'addDictionary', payload: values })
  }

  const handleRemoveDictionary = (field: string) => {
    dispatch({ type: 'removeDictionary', payload: field })
  }

  const handleAddTag = (values: TagItem) => {
    dispatch({ type: 'addTag', payload: values })
  }

  const handleRemoveTag = (name: string) => {
    dispatch({ type: 'removeTag', payload: name })
  }

  const handleAddConfig = (values: ConfigItem) => {
    dispatch({ type: 'addConfig', payload: values })
  }

  const handleRemoveConfig = (key: string) => {
    dispatch({ type: 'removeConfig', payload: key })
  }

  return (
    <Card className="metadata-panel">
      <Title level={4}>元数据管理</Title>
      <Text>管理埋点字段、标签和全局配置，为分析提供统一规范。</Text>
      <Tabs
        className="metadata-tabs"
        items={[
          {
            key: 'dictionary',
            label: '数据字典',
            children: (
              <DataDictionary
                data={state.dictionary}
                onAdd={handleAddDictionary}
                onRemove={handleRemoveDictionary}
              />
            ),
          },
          {
            key: 'tags',
            label: '标签与分类',
            children: (
              <TagsManager data={state.tags} onAdd={handleAddTag} onRemove={handleRemoveTag} />
            ),
          },
          {
            key: 'config',
            label: '配置项',
            children: (
              <ConfigManager
                data={state.configs}
                onAdd={handleAddConfig}
                onRemove={handleRemoveConfig}
              />
            ),
          },
        ]}
      />
    </Card>
  )
}

export default MetadataPanel
