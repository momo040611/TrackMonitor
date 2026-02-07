import { Injectable } from '@nestjs/common'
import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'

@Injectable()
export class AIService {
  private aiChatModel: ChatOpenAI

  constructor() {
    // 验证API密钥是否存在
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured in environment variables')
    }

    // 初始化DeepSeek模型
    this.aiChatModel = new ChatOpenAI({
      apiKey: apiKey,
      model: 'deepseek-chat', // 可选：deepseek-chat 或 deepseek-coder
      temperature: 0.7, // 控制随机性，0-1之间
      maxTokens: 2048, // 最大输出token数
      timeout: 30000, // 30秒超时
      configuration: {
        baseURL: 'https://api.deepseek.com', // 关键：指定DeepSeek的API地址
      },
    })
  }

  //分析
  async analyzeEvent(prompt: string, data?: any): Promise<string> {
    try {
      const fullPrompt = `${prompt}\n\n分析数据：${JSON.stringify(data, null, 2)}`
      const response = await this.aiChatModel.invoke([
        new SystemMessage(
          `你是一个专业的事件分析助手。请根据提供的事件数据和分析提示，按照以下模板返回分析结果：
# 事件分析报告
概览
总事件数：[总事件数]
时间范围：[开始时间] 至 [结束时间]
主要事件类型：[主要事件类型]

关键发现
1. [发现1]
2. [发现2]
3. [发现3]

建议
[建议1]
[建议2]

数据摘要
错误事件数：[错误事件数]
性能事件数：[性能事件数]
用户行为事件数：[用户行为事件数]

请保持分析简洁明了，直接进入主题，避免冗长的引言和不必要的解释。`
        ),
        new HumanMessage(fullPrompt),
      ])
      console.log(response)
      return response.content as string
    } catch (error) {
      console.error('AI分析事件失败:', error)
      throw new Error(`AI分析事件失败: ${error.message}`)
    }
  }
}
