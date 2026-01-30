import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RegisterScreen } from './register'
import { LoginScreen } from './login'
import styled from '@emotion/styled'
import { ErrorBox } from '../components/lib'

export default function UnauthenticatedApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 根据当前路径自动设置注册状态
  useEffect(() => {
    setIsRegister(location.pathname === '/register')
  }, [location.pathname])

  //   useDocumentTitle("DataPilot监控平台");

  const handleToggleRegister = () => {
    const newIsRegister = !isRegister
    setIsRegister(newIsRegister)
    navigate(newIsRegister ? '/register' : '/login')
  }

  return (
    <Container>
      <Logo>DataPilot</Logo>
      <Card>
        <Title>{isRegister ? '请注册' : '请登录'}</Title>
        {error && <ErrorBox error={error} />}
        {isRegister ? (
          <RegisterScreen key="register" onError={setError} />
        ) : (
          <LoginScreen key="login" onError={setError} />
        )}
        <RegisterLink onClick={handleToggleRegister}>
          {isRegister ? '已经有账号了？直接登录' : '没有账号？注册新账号'}
        </RegisterLink>
      </Card>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
`

const Logo = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #3385ff;
  margin-bottom: 40px;
  text-align: center;
`

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 300px;
  height: 450px;
  text-align: center;
`

const Title = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 28px;
`

const RegisterLink = styled.div`
  font-size: 15px;
  color: #666;
  margin-top: 20px;
  text-align: center;
  cursor: pointer;
  a {
    color: #3385ff;
    text-decoration: none;
  }
  &:hover {
    color: #3385ff;
  }
`

// 导出自定义样式组件供登录和注册页面使用
export const StyledInput = styled.input`
  width: 100%;
  padding: 14px;
  font-size: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3385ff;
    box-shadow: 0 0 0 2px rgba(51, 133, 255, 0.2);
  }
`

export const StyledButton = styled.button`
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background-color: #3385ff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #2d77e3;
  }
  &:disabled {
    cursor: pointer;
    background-color: #3385ff;
  }
`
