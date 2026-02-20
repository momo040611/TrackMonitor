import { useState, useEffect } from 'react'
import { useAuth } from '../context/auth-context'
import { StyledInput, StyledButton } from './index'

export const RegisterScreen = ({ onError }: { onError: (error: Error) => void }) => {
  const { register, checkUsername } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cpassword, setCpassword] = useState('')
  const [email, setEmail] = useState('')
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
    if (!username.trim()) {
      onError(new Error('请输入用户名'))
      return
    }
    if (!email.trim()) {
      onError(new Error('请输入邮箱'))
      return
    }
    if (!password) {
      onError(new Error('请输入密码'))
      return
    }
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
      await register({ username, password, email })
    } catch (e: any) {
      console.log('注册错误：', e)
      // 处理后端返回的错误
      if (e.message && e.message.includes('Duplicate entry')) {
        // 尝试解析错误信息，判断是哪个字段重复
        if (e.message.includes('username')) {
          onError(new Error('用户名已存在'))
        } else if (e.message.includes('email')) {
          onError(new Error('邮箱已存在'))
        } else {
          onError(new Error('注册失败，请稍后重试'))
        }
      } else if (e.message && e.message.includes('Username is already taken')) {
        onError(new Error('用户名已存在'))
      } else if (e.message) {
        onError(new Error(e.message))
      } else {
        onError(e as Error)
      }
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
        type="email"
        placeholder="请输入邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
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
