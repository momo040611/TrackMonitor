import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { BarChartOutlined, LineChartOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useAuth } from '../../context/useAuth'
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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // 使用 Ant Design Dropdown 的菜单配置
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '登出',
      onClick: handleLogout,
    },
  ]

  return (
    <div className="mainLayout">
      <div className="header">
        <div className="logo">DataPilot监控平台</div>
        <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
          <div className="userInfo" style={{ cursor: 'pointer' }}>
            <UserOutlined style={{ marginRight: '8px' }} />
            <span className="username">{user?.username || '用户名'}</span>
          </div>
        </Dropdown>
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
