export const AiService = {
  // 从 mock 接口获取生成的代码
  generateCode: async (requirement: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirement }),
      })
      const result = await response.json()
      if (result.code === 200) {
        return result.data
      }
      throw new Error('生成代码失败')
    } catch (error) {
      console.error('生成代码失败:', error)
      return `// 生成代码失败，请重试\ntracker.log('error', { message: 'Code generation failed' });`
    }
  },
}
