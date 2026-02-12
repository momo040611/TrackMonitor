import { AppProviders } from './context'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  // 初始加载完成后设置为false
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // 全局加载效果
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3385ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px',
            }}
          ></div>
          <div
            style={{
              fontSize: '16px',
              color: '#333',
            }}
          >
            加载中...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </div>
  )
}

export default App
