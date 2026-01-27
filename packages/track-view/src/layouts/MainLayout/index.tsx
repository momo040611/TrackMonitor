import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainLayout.less';

interface MenuItem {
  key: string;
  title: string;
  icon: string;
  path: string;
}

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const menuItems: MenuItem[] = [
    {
      key: 'data-display',
      title: '数据展示与设置',
      icon: '📊',
      path: '/data-display'
    },
    {
      key: 'data-analysis',
      title: '数据分析',
      icon: '📈',
      path: '/data-analysis'
    },
    {
      key: 'user-tracking',
      title: '用户追踪',
      icon: '👥',
      path: '/user-tracking'
    },
    {
      key: 'smart-hall',
      title: '智能大厅',
      icon: '🤖',
      path: '/smart-hall'
    }
  ];

  const [showLogout, setShowLogout] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="mainLayout">
      <div className="header">
        <div className="logo">埋点SDK监控平台</div>
        <div className="userInfo" onClick={() => setShowLogout(!showLogout)}>
          <span className="username">用户名</span>
          <span style={{ marginLeft: '8px' }}>▼</span>
          {showLogout && (
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '24px',
              backgroundColor: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: '8px 0',
              zIndex: 1000
            }}>
              <div 
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
              >
                登出
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="content">
        <div className="sidebar">
          <div className="menu">
            {menuItems.map((item) => (
              <Link to={item.path} key={item.key} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`menuItem ${location.pathname === item.path ? 'active' : ''}`}>
                  <span className="icon">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mainContent">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;