import { createBrowserRouter } from 'react-router-dom'
import ErrorPage from '../components/ErrorPage'
import {
  LazyWrapper,
  ProtectedLayout,
  UnauthenticatedLayout,
  DataDisplay,
  DataAnalysis,
  UserTracking,
  SmartHall,
} from './components'

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
