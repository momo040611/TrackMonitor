import { createBrowserRouter, Navigate } from 'react-router-dom'
import React, { lazy, Suspense } from 'react'
import { useAuth } from '../context/auth-context'
import MainLayout from '../layouts/MainLayout/index'
import UnauthenticatedApp from '../unauthenticated-app'
import ErrorPage from '../components/ErrorPage'
import LoadingPage from '../components/LoadingPage'

// 懒加载页面组件
const DataDisplay = lazy(() => import('../pages/DataDisplay'))
const DataAnalysis = lazy(() => import('../pages/DataAnalysis'))
const UserTracking = lazy(() => import('../pages/UserTracking'))
const SmartHall = lazy(() => import('../pages/SmartHall'))

// 懒加载包装组件
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingPage />}>{children}</Suspense>
)

// 路由保护组件
const ProtectedLayout = () => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <MainLayout />
}

// 未认证路由组件
const UnauthenticatedLayout = () => {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/" replace />
  }
  return <UnauthenticatedApp />
}

// 主路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: (
          <LazyWrapper>
            <DataDisplay />
          </LazyWrapper>
        ),
      },
      {
        path: 'data-display',
        element: (
          <LazyWrapper>
            <DataDisplay />
          </LazyWrapper>
        ),
      },
      {
        path: 'data-analysis',
        element: (
          <LazyWrapper>
            <DataAnalysis />
          </LazyWrapper>
        ),
      },
      {
        path: 'user-tracking',
        element: (
          <LazyWrapper>
            <UserTracking />
          </LazyWrapper>
        ),
      },
      {
        path: 'smart-hall',
        element: (
          <LazyWrapper>
            <SmartHall />
          </LazyWrapper>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <UnauthenticatedLayout />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/register',
    element: <UnauthenticatedLayout />,
    errorElement: <ErrorPage />,
  },
  {
    path: '*',
    element: <ErrorPage status={404} />,
  },
])

export default router
