import React from 'react';
import type { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// 懒加载页面组件
const SmartHall = React.lazy(() => import('../pages/SmartHall/index.tsx'));
const DataAnalysis = React.lazy(() => import('../pages/DataAnalysis/index.tsx'));
const DataDisplay = React.lazy(() => import('../pages/DataDisplay/index.tsx'));
const UserTracking = React.lazy(() => import('../pages/UserTracking/index.tsx'));

// 路由规则
const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout><SmartHall /></MainLayout>,
  },
  {
    path: '/smart-hall',
    element: <MainLayout><SmartHall /></MainLayout>,
  },
  {
    path: '/data-analysis',
    element: <MainLayout><DataAnalysis /></MainLayout>,
  },
  {
    path: '/data-display',
    element: <MainLayout><DataDisplay /></MainLayout>,
  },
  {
    path: '/user-tracking',
    element: <MainLayout><UserTracking /></MainLayout>,
  },
];

export default routes;