import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/auth-context'
import MainLayout from './layouts/MainLayout'
import UnauthenticatedApp from './unauthenticated-app'
import DataDisplay from './pages/DataDisplay'
import DataAnalysis from './pages/DataAnalysis'
import UserTracking from './pages/UserTracking'
import SmartHall from './pages/SmartHall'

// 路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// 未认证路由组件
const UnauthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

const Router = () => {
  return (
    <div>
      <Routes>
        {/* 未认证路由 */}
        <Route
          path="/login"
          element={
            <UnauthenticatedRoute>
              <UnauthenticatedApp />
            </UnauthenticatedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnauthenticatedRoute>
              <UnauthenticatedApp />
            </UnauthenticatedRoute>
          }
        />

        {/* 受保护路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DataDisplay />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-display"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DataDisplay />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-analysis"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DataAnalysis />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-tracking"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserTracking />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/smart-hall"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SmartHall />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* 重定向所有未匹配的路由到登录页 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default Router
