import React, { Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import MainLayout from '../layouts/MainLayout/index'
import UnauthenticatedApp from '../unauthenticated-app'
import LoadingPage from '../components/LoadingPage'

// 懒加载页面组件
const DataDisplay = React.lazy(() => import('../pages/DataDisplay'))
const DataAnalysis = React.lazy(() => import('../pages/DataAnalysis'))
const UserTracking = React.lazy(() => import('../pages/UserTracking'))
const SmartHall = React.lazy(() => import('../pages/SmartHall'))

// 懒加载包装组件
export const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingPage />}>{children}</Suspense>
)

// 路由保护组件
export const ProtectedLayout = () => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <MainLayout />
}

// 未认证路由组件
export const UnauthenticatedLayout = () => {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/" replace />
  }
  return <UnauthenticatedApp />
}

// 页面组件导出
export { DataDisplay, DataAnalysis, UserTracking, SmartHall }
