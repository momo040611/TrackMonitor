import React from 'react';

const SmartHall: React.FC = () => {
  return (
    <div>
      <h1 className="pageTitle">智能大厅</h1>
      <div className="pageContent">
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666' }}>
          欢迎来到智能大厅页面，这里可以查看数据可视化大屏和告警中心。
        </p>
      </div>
    </div>
  );
};

export default SmartHall;