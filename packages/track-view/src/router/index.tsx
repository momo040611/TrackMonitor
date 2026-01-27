import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import routes from '../routes'

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>加载中...</div>}>
        <Routes>
          {/* 直接加载所有路由，无需登录 */}
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* 重定向到智能大厅 */}
          <Route
            path="/*"
            element={<Suspense fallback={<div>加载中...</div>}>{routes[0].element}</Suspense>}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default Router
