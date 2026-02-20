import { useState } from 'react'
import { useAuth } from '../context/auth-context'
import { StyledInput, StyledButton } from './index'
export const LoginScreen = ({ onError }: { onError: (error: Error) => void }) => {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Handle submit called with username:', username, 'password:', password)
    try {
      setIsLoading(true)
      console.log('About to call login')
      await login({ username, password })
      console.log('Login completed successfully')
    } catch (e) {
      console.log('Login error:', e)
      onError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <StyledInput
        type="text"
        placeholder="请输入用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <StyledInput
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <StyledButton type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.7)',
                borderRadius: '50%',
                borderTopColor: '#fff',
                animation: 'spin 1s linear infinite',
                marginRight: '8px',
              }}
            ></div>
            登录
          </>
        ) : (
          '登录'
        )}
      </StyledButton>
    </form>
  )
}
