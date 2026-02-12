// 共享数据服务，用于在不同页面间传递和管理数据

// 数据处理结果类型
export interface ProcessedData {
  id: string
  type: string
  value: any
  timestamp: number
  metadata?: Record<string, any>
}

// 用户配置类型
export interface UserConfig {
  dataFilters: Record<string, any>
  visualizationSettings: Record<string, any>
  analysisPreferences: Record<string, any>
}

// 共享数据服务
const sharedDataService = {
  // 存储处理后的数据
  processedData: [] as ProcessedData[],

  // 保存处理后的数据
  saveProcessedData: (data: ProcessedData | ProcessedData[]) => {
    if (Array.isArray(data)) {
      sharedDataService.processedData = [...sharedDataService.processedData, ...data]
    } else {
      sharedDataService.processedData.push(data)
    }
    // 保存到 localStorage，实现页面刷新后的数据持久化
    localStorage.setItem('processedData', JSON.stringify(sharedDataService.processedData))
  },

  // 获取处理后的数据
  getProcessedData: (filters?: Record<string, any>) => {
    // 从 localStorage 加载数据，确保数据同步
    const storedData = localStorage.getItem('processedData')
    if (storedData) {
      sharedDataService.processedData = JSON.parse(storedData)
    }

    if (!filters) {
      return sharedDataService.processedData
    }

    // 根据过滤条件筛选数据
    return sharedDataService.processedData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key as keyof ProcessedData] === value
      })
    })
  },

  // 清除处理后的数据
  clearProcessedData: () => {
    sharedDataService.processedData = []
    localStorage.removeItem('processedData')
  },

  // 保存用户配置
  saveUserConfig: (config: UserConfig) => {
    localStorage.setItem('userConfig', JSON.stringify(config))
  },

  // 加载用户配置
  loadUserConfig: (): UserConfig => {
    const storedConfig = localStorage.getItem('userConfig')
    return storedConfig
      ? JSON.parse(storedConfig)
      : {
          dataFilters: {},
          visualizationSettings: {},
          analysisPreferences: {},
        }
  },

  // 导出数据为 URL 参数，用于页面间传递
  exportDataAsUrlParams: (data: any): string => {
    return new URLSearchParams(data).toString()
  },

  // 从 URL 参数导入数据
  importDataFromUrlParams: (params: URLSearchParams): any => {
    const data: any = {}
    params.forEach((value, key) => {
      try {
        data[key] = JSON.parse(value)
      } catch {
        data[key] = value
      }
    })
    return data
  },
}

export default sharedDataService
