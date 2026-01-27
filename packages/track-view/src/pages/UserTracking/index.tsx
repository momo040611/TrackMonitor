import React from 'react';

const UserTracking: React.FC = () => {
  return (
    <div>
      <h1 className="pageTitle">用户追踪</h1>
      <div className="pageContent">
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '24px' }}>
          用户追踪页面，用于追踪和分析用户的行为路径和使用习惯。
        </p>

      </div>
    </div>
  );
};

export default UserTracking;