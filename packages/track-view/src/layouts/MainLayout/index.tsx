import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChartOutlined, LineChartOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/auth-context'
import './MainLayout.less'

interface MenuItem {
  key: string
  title: string
  icon: React.ReactNode
  path: string
}

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // useDocumentTitle("DataPilot监控平台")

  const menuItems: MenuItem[] = [
    {
      key: 'data-display',
      title: '数据展示与设置',
      icon: <BarChartOutlined />,
      path: '/data-display',
    },
    {
      key: 'data-analysis',
      title: '数据分析',
      icon: <LineChartOutlined />,
      path: '/data-analysis',
    },
    {
      key: 'user-tracking',
      title: '用户追踪',
      icon: <UserOutlined />,
      path: '/user-tracking',
    },
    {
      key: 'smart-hall',
      title: '智能大厅',
      icon: <RobotOutlined />,
      path: '/smart-hall',
    },
  ]

  const [showLogout, setShowLogout] = React.useState(false)
  const logoutTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleMouseEnter = () => {
    // 清除之前的定时器
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current)
      logoutTimeoutRef.current = null
    }
    setShowLogout(true)
  }

  const handleMouseLeave = () => {
    // 设置0.5秒后隐藏登出按钮
    logoutTimeoutRef.current = setTimeout(() => {
      setShowLogout(false)
    }, 500)
  }

  return (
    <div className="mainLayout">
      <div className="header">
        <div className="logo">DataPilot监控平台</div>
        <div
          className="userInfo"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <UserOutlined style={{ marginRight: '8px' }} />
          <span className="username">{user?.username || '用户名'}</span>
          {showLogout && (
            <div
              style={{
                position: 'absolute',
                top: '60px',
                right: '24px',
                backgroundColor: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '8px 0',
                zIndex: 1000,
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333',
                }}
                onClick={handleLogout}
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
              <Link
                to={item.path}
                key={item.key}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={`menuItem ${location.pathname === item.path ? 'active' : ''}`}>
                  <span className="icon">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mainContent">{children}</div>
      </div>
    </div>
  )
}

export default MainLayout
