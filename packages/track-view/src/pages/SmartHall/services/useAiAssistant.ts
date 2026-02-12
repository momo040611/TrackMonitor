import { api } from '../../../api/request'

export const AiService = {
  // 使用 api 对象中的接口获取生成的代码
  generateCode: async (requirement: string): Promise<string> => {
    try {
      const result = await api.generateCode({ requirement })
      if (result.status === 200) {
        return result.data
      }
      throw new Error('生成代码失败')
    } catch (error) {
      console.error('生成代码失败:', error)
      return `// 生成代码失败，请重试\ntracker.log('error', { message: 'Code generation failed' });`
    }
  },

  // 添加其他 AI 相关接口
  getAiAnalysisData: async (analysisType: string) => {
    try {
      let result
      // 根据分析类型选择不同的后端接口
      switch (analysisType) {
        case 'anomaly-diagnosis':
          result = await api.analyzeErrorEvents({ projectId: 'default', timeRange: '24h' })
          break
        case 'root-cause-analysis':
          result = await api.analyzeAllEvents({ projectId: 'default', timeRange: '24h' })
          break
        case 'log-parser':
          result = await api.analyzeErrorEvents({ projectId: 'default', timeRange: '24h' })
          break
        default:
          result = await api.analyzeAllEvents({ projectId: 'default', timeRange: '24h' })
      }

      if (result.status === 200) {
        return result.data
      }
      throw new Error('获取 AI 分析数据失败')
    } catch (error) {
      console.error('获取 AI 分析数据失败:', error)
      throw error
    }
  },

  sendAiQuery: async (query: string) => {
    try {
      // 使用分析错误事件接口模拟 AI 查询
      const result = await api.analyzeErrorEvents({ projectId: 'default', timeRange: '24h' })
      if (result.status === 200) {
        return result.data
      }
      throw new Error('发送 AI 查询失败')
    } catch (error) {
      console.error('发送 AI 查询失败:', error)
      throw error
    }
  },

  // 智能分派接口
  smartDispatch: async (taskDescription: string) => {
    try {
      // 使用分析所有事件接口模拟智能分派
      const result = await api.analyzeAllEvents({ projectId: 'default', timeRange: '24h' })
      if (result.status === 200) {
        return result.data
      }
      throw new Error('智能分派失败')
    } catch (error) {
      console.error('智能分派失败:', error)
      throw error
    }
  },
}
