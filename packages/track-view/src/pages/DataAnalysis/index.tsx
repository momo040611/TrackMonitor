import React, { useState, useCallback } from 'react'
import { Button, message, Space, Upload, Modal, Form } from 'antd'
import { ExportOutlined, ReloadOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { UploadProps } from 'antd'
type RcFile = File & { uid: string }
import DataCleaningPanel from './components/DataCleaningPanel'
import DataAggregationPanel from './components/DataAggregationPanel'
import MetadataPanel from './components/MetadataPanel'
import type { CleanedRecord } from './services/data-cleaning'
import { api } from '../../api/request'

const DataAnalysis: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0)
  const [cleaned, setCleaned] = useState<CleanedRecord[]>([])
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1) // 改变 key，强制重新挂载下方的面板
    setCleaned([]) // 清空当前页面的临时状态
    message.success('数据已局部刷新')
  }, [])

  // 导出数据到 DataDisplay 页面
  const handleExportData = () => {
    if (cleaned.length === 0) {
      message.warning('请先进行数据清洗，再导出数据')
      return
    }

    // 跳转到 DataDisplay 页面
    navigate('/data-display?source=data-analysis&exported=true')
    message.success('数据导出成功，正在跳转到数据展示页面...')
  }

  // 导入配置
  const handleImportConfig: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    setImportLoading(true)
    try {
      // 模拟配置导入
      message.success('配置导入成功')
      onSuccess?.(file)
      setIsImportModalOpen(false)
      // 刷新页面以加载新配置
      // window.location.reload()
      handleRefresh()
    } catch (error) {
      message.error('配置导入失败')
      onError?.(error as any, file)
    } finally {
      setImportLoading(false)
    }
  }

  // 导出配置
  const handleExportConfig = async () => {
    setExportLoading(true)
    try {
      // 模拟配置导出
      const mockConfig = {
        dataCleaning: {
          removeDuplicates: true,
          normalizeData: true,
          validateData: true,
        },
        dataAggregation: {
          groupBy: 'event_type',
          calculateMetrics: true,
        },
        metadata: {
          tags: ['performance', 'error', 'user_behavior'],
          configs: {},
        },
      }

      message.success('配置导出成功')
      // 处理导出数据
      const dataStr = JSON.stringify(mockConfig, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'analysis-config.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      message.error('配置导出失败')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div>
      <div className="pageContent">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2 className="pageTitle">数据分析</h2>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新数据
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setIsImportModalOpen(true)}>
              导入配置
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportConfig}
              loading={exportLoading}
            >
              导出配置
            </Button>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={handleExportData}
              disabled={cleaned.length === 0}
            >
              导出数据到数据展示
            </Button>
          </Space>
        </div>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          数据分析页面，用于深入分析SDK的使用数据和性能指标。
        </p>
        <div key={refreshKey}>
          <div style={{ marginBottom: '24px' }}>
            <DataCleaningPanel onCleanedChange={setCleaned} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <DataAggregationPanel cleaned={cleaned} />
          </div>
          <div>
            <MetadataPanel />
          </div>
        </div>
      </div>

      {/* 导入配置模态框 */}
      <Modal
        title="导入配置"
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="配置文件">
            <Upload customRequest={handleImportConfig} showUploadList={false} accept=".json">
              <Button type="primary" icon={<UploadOutlined />} loading={importLoading}>
                选择文件
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <p style={{ color: '#666' }}>请上传 JSON 格式的配置文件</p>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DataAnalysis
