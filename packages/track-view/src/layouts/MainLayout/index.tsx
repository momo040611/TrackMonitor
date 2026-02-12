import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { BarChartOutlined, LineChartOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/auth-context'
import './MainLayout.less'

interface MenuItem {
  key: string
  title: string
  icon: React.ReactNode
  path: string
}

const MainLayout: React.FC = () => {
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

  // 生成面包屑导航
  const getBreadcrumbItems = () => {
    const pathname = location.pathname
    const items = []

    // 只在非根路径时添加首页
    if (pathname !== '/') {
      items.push({ title: <Link to="/">首页</Link>, key: '/' })
    }

    // 根据当前路径添加对应的面包屑项
    menuItems.forEach((item) => {
      if (pathname.startsWith(item.path) && item.path !== '/') {
        items.push({
          title: <Link to={item.path}>{item.title}</Link>,
          key: item.path,
        })

        // 处理子路径
        if (pathname !== item.path) {
          const subPath = pathname.replace(item.path, '')
          if (subPath) {
            items.push({
              title: subPath.replace('/', '').replace(/-/g, ' '),
              key: pathname,
            })
          }
        }
      }
    })

    return items
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
        <div className="mainContent">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MainLayout
