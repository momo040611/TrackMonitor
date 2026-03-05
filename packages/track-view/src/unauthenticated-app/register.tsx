import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { useDebounce } from '../hooks/useDebounce'
import { StyledInput, StyledButton } from './styled'

export const RegisterScreen = ({ onError }: { onError: (error: Error) => void }) => {
  const { register, checkUsername } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cpassword, setCpassword] = useState('')
  const [email, setEmail] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)

  // 使用 useDebounce 对用户名进行防抖
  const debouncedUsername = useDebounce(username, 500)

  useEffect(() => {
    const checkUsernameAsync = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true)
        try {
          await checkUsername(debouncedUsername)
          setUsernameError('')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '用户名已存在'
          setUsernameError(errorMessage)
        } finally {
          setIsCheckingUsername(false)
        }
      } else {
        setUsernameError('')
      }
    }

    checkUsernameAsync()
  }, [debouncedUsername, checkUsername])

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
    } catch (e) {
      // 处理后端返回的错误
      const errorMessage = e instanceof Error ? e.message : ''
      if (errorMessage.includes('Duplicate entry')) {
        // 尝试解析错误信息，判断是哪个字段重复
        if (errorMessage.includes('username')) {
          onError(new Error('用户名已存在'))
        } else if (errorMessage.includes('email')) {
          onError(new Error('邮箱已存在'))
        } else {
          onError(new Error('注册失败，请稍后重试'))
        }
      } else if (errorMessage.includes('Username is already taken')) {
        onError(new Error('用户名已存在'))
      } else if (errorMessage) {
        onError(new Error(errorMessage))
      } else {
        onError(e instanceof Error ? e : new Error('注册失败'))
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
