import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import { StyledInput, StyledButton } from './index'

export const RegisterScreen = ({ onError }: { onError: (error: Error) => void }) => {
  const { register, checkUsername } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cpassword, setCpassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username) {
        setIsCheckingUsername(true)
        try {
          await checkUsername(username)
          setUsernameError('')
        } catch (error: any) {
          setUsernameError(error.message || '用户名已存在')
        } finally {
          setIsCheckingUsername(false)
        }
      } else {
        setUsernameError('')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username, checkUsername])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cpassword !== password) {
      onError(new Error('请确认两次输入的密码相同'))
      return
    }
    if (usernameError) {
      onError(new Error(usernameError))
      return
    }
    try {
      setIsLoading(true)
      await register({ username, password })
    } catch (e) {
      onError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <StyledInput
          type="text"
          placeholder="请输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={usernameError ? { borderColor: 'red' } : {}}
        />
        {usernameError && (
          <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{usernameError}</div>
        )}
        {isCheckingUsername && (
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>检查用户名...</div>
        )}
      </div>
      <StyledInput
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <StyledInput
        type="password"
        placeholder="请确认密码"
        value={cpassword}
        onChange={(e) => setCpassword(e.target.value)}
      />
      <StyledButton type="submit" disabled={isLoading || !!usernameError || isCheckingUsername}>
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
            注册
          </>
        ) : (
          '注册'
        )}
      </StyledButton>
    </form>
  )
}
