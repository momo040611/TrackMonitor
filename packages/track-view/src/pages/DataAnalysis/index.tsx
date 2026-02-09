import React, { useState } from 'react'
import DataCleaningPanel from './components/DataCleaningPanel'
import DataAggregationPanel from './components/DataAggregationPanel'
import MetadataPanel from './components/MetadataPanel'
import type { CleanedRecord } from './services/data-cleaning'

const DataAnalysis: React.FC = () => {
  const [cleaned, setCleaned] = useState<CleanedRecord[]>([])

  return (
    <div>
      <div className="pageContent">
        <h2 className="pageTitle">数据分析</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          数据分析页面，用于深入分析SDK的使用数据和性能指标。
        </p>
        <DataCleaningPanel onCleanedChange={setCleaned} />
        <DataAggregationPanel cleaned={cleaned} />
        <MetadataPanel />
      </div>
    </div>
  )
}

export default DataAnalysis
