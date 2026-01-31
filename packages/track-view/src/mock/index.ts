import type { MockMethod } from 'vite-plugin-mock'

console.log('Mock module loaded')
// 只在 Node.js 环境中打印当前工作目录
if (typeof process !== 'undefined') {
  console.log('Current working directory:', process.cwd())
}

// 模拟用户数据
const mockUsers = [
  { id: '1', username: 'admin', password: '123456', token: 'mock-token-admin' },
  { id: '2', username: 'test', password: '123456', token: 'mock-token-test' },
]

// 登录接口
const loginMock: MockMethod = {
  url: '/api/login',
  method: 'post',
  response: (options: any) => {
    const { username, password } = options.body
    const user = mockUsers.find((u) => u.username === username && u.password === password)

    if (user) {
      return { code: 200, user }
    } else {
      return { code: 401, message: '用户名或密码错误' }
    }
  },
}

// 注册接口
const registerMock: MockMethod = {
  url: '/api/register',
  method: 'post',
  response: (options: any) => {
    const { username, password } = options.body
    const existingUser = mockUsers.find((u) => u.username === username)

    if (existingUser) {
      return { code: 400, message: '用户名已存在' }
    } else {
      const newUser = {
        id: Date.now().toString(36),
        username,
        password,
        token: `mock-token-${Date.now()}`,
      }
      mockUsers.push(newUser)
      return { code: 200, user: newUser }
    }
  },
}

// 获取当前用户信息接口
const meMock: MockMethod = {
  url: '/api/me',
  method: 'get',
  response: (options: any) => {
    const authHeader = options.headers.authorization
    if (!authHeader) {
      return { code: 401, message: '请重新登录' }
    }

    const token = authHeader.split(' ')[1]
    const user = mockUsers.find((u) => u.token === token)

    if (user) {
      return { code: 200, user }
    } else {
      return { code: 401, message: '请重新登录' }
    }
  },
}

// 检查用户名是否已存在接口
const checkUsernameMock: MockMethod = {
  url: '/api/check-username',
  method: 'post',
  response: (options: any) => {
    const { username } = options.body
    const existingUser = mockUsers.find((u) => u.username === username)

    if (existingUser) {
      return { code: 400, message: '用户名已存在' }
    } else {
      return { code: 200, message: '用户名可用' }
    }
  },
}

// 导出模拟接口
const mockModules = [loginMock, registerMock, meMock, checkUsernameMock]

// 导出生产环境使用的函数
export const setupProdMockServer = () => {
  // 生产环境中我们不使用模拟接口
}

// 导出模拟模块
export default mockModules
