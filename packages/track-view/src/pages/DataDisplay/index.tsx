import React from 'react'

const DataDisplay: React.FC = () => {
  return (
    <div>
      <h1 className="pageTitle">数据展示与设置</h1>
      <div className="pageContent">
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          数据展示与设置页面，用于展示SDK的基础数据和配置相关设置。
        </p>
      </div>
    </div>
  )
}

export default DataDisplay
