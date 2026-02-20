import { api } from '../../../api/request'

export const AiService = {
  // 生成埋点代码
  generateCode: async (requirement: string): Promise<string> => {
    try {
      // 模拟生成代码，因为后端没有提供 generateCode 接口
      console.log('生成代码请求:', requirement)
      // 这里可以根据 requirement 生成不同的代码
      const generatedCode = `// 生成的埋点代码\ntracker.log('custom', {\n  eventName: '${requirement.replace(/[^a-zA-Z0-9_]/g, '_')}',\n  timestamp: Date.now(),\n  userAgent: navigator.userAgent\n});`
      return generatedCode
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
          result = await api.analyzeErrorEvents({ time: '24h' })
          break
        case 'root-cause-analysis':
          result = await api.analyzeAllEvents({ time: '24h' })
          break
        case 'log-parser':
          result = await api.analyzeErrorEvents({ time: '24h' })
          break
        case 'user-behavior':
          result = await api.analyzeUserBehaviorEvents({ time: '24h' })
          break
        case 'performance':
          result = await api.analyzePerformanceEvents({ time: '24h' })
          break
        default:
          result = await api.analyzeAllEvents({ time: '24h' })
      }

      if (result.status === 200 || result.status === 0) {
        return result.data
      }
      throw new Error('获取 AI 分析数据失败')
    } catch (error) {
      console.error('获取 AI 分析数据失败:', error)
      // 返回模拟数据，确保前端应用正常运行
      return {
        analysis: 'AI 分析暂时不可用，请稍后重试',
        recommendations: [
          '检查后端服务是否正常运行',
          '确认数据库连接状态',
          '查看服务器日志获取详细错误信息',
        ],
        confidence: 0.5,
        issues: [
          {
            id: '1',
            level: 'error',
            title: '后端服务暂时不可用',
            description: '无法连接到后端分析服务，可能是服务正在维护或网络连接问题。',
            suggestion: '请稍后重试，或联系系统管理员检查后端服务状态。',
            affected_scope: '全局',
            score_impact: 10,
          },
          {
            id: '2',
            level: 'warning',
            title: '分析数据获取失败',
            description: '无法获取异常分析数据，使用默认数据进行展示。',
            suggestion: '请检查网络连接，确保前端可以正常访问后端服务。',
            affected_scope: '异常诊断模块',
            score_impact: 5,
          },
        ],
      }
    }
  },

  sendAiQuery: async (query: string) => {
    try {
      // 使用分析错误事件接口模拟 AI 查询
      const result = await api.analyzeErrorEvents({ time: '24h' })
      if (result.status === 200 || result.status === 0) {
        return result.data
      }
      throw new Error('发送 AI 查询失败')
    } catch (error) {
      console.error('发送 AI 查询失败:', error)
      // 返回模拟数据，确保前端应用正常运行
      return {
        response: 'AI 查询暂时不可用，请稍后重试',
        query: query,
        timestamp: new Date().toISOString(),
      }
    }
  },

  // 智能分派接口
  smartDispatch: async (taskDescription: string) => {
    try {
      // 使用分析所有事件接口模拟智能分派
      const result = await api.analyzeAllEvents({ time: '24h' })
      if (result.status === 200 || result.status === 0) {
        return result.data
      }
      throw new Error('智能分派失败')
    } catch (error) {
      console.error('智能分派失败:', error)
      // 返回模拟数据，确保前端应用正常运行
      return {
        assignedTo: '系统管理员',
        priority: 'medium',
        estimatedTime: '30分钟',
        taskDescription: taskDescription,
        timestamp: new Date().toISOString(),
      }
    }
  },
}
