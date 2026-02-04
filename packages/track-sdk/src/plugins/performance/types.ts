export enum PerformanceMetricType {
    /** 
   * 页面加载性能指标 
   */ 
  PAGE_LOAD = 'page_load', 

  /** 
   * 关键渲染指标 
   */ 
  PAINT = 'paint', 

  /** 
   * 资源加载性能指标 
   */ 
  RESOURCE = 'resource', 

  /** 
   * 网络请求性能指标 
   */ 
  NETWORK = 'network', 

  /** 
   * 交互性能指标 
   */ 
  INTERACTION = 'interaction', 

  /** 
   * JavaScript性能指标 
   */ 
  JAVASCRIPT = 'javascript', 

  /** 
   * 内存性能指标 
   */ 
  MEMORY = 'memory', 


  /** 
   * 长任务性能指标 
   */ 
  LONG_TASK = 'long_task', 

  /** 
   * 自定义性能指标 
   */ 
  CUSTOM = 'custom', 
}
export interface PerformanceInfo {
  /**
   * 指标类型
   */
  type: PerformanceMetricType;

  /**
   * 指标名称
   */
  name: string;

  /**
   * 核心指标值
   */
  value: number;

  /**
   * 指标单位
   */
  unit: 'ms' | 'byte' | 'count' | 'percent' | 'fps' | 'score' | 'px' | 'custom';

  /**
   * 数据采集时间戳
   */
  time: number;

  /**
   * 页面基础信息
   */
  pageInfo: {
    /** 页面完整URL */
    url: string;
    /** 页面标题 */
    title: string;
    /** 页面来源 */
    referrer: string;
    /** 页面路由哈希 */
    hash: string;
    /** 页面唯一标识 */
    pageId?: string;
  };

  /** 
   * 用户代理信息
   */
  userAgent: string;

  /**
   * 详细信息
   */
  detail: Record<string, any>
}

/** 
 * 页面加载性能指标接口
 */
export interface PageLoadMetrics {

  /** 
   * 导航开始时间戳
   */ 
  navigationStart: number;

  /**
   * DOM交互时间戳
   */
  domInteractive: number;

  /** 
   * DOM完成时间戳
   */
  domComplete: number;

  /** 
   * 页面加载完成时间戳
   */
  loadComplete?: number;

  /** 
   * 首次绘制(FP)时间戳
   */
  firstPaint?: number;

  /** 
   * 首次内容绘制(FCP)时间戳
   */
  firstContentfulPaint?: number;

  /** 
   * 最大内容绘制(LCP)时间戳
   */
  largestContentfulPaint?: number;
    
  /**
   * 首次输入延迟
   */
  firstInputDelay?: number;

  /**
   * 累计布局偏移
   */
  cumulativeLayoutShift?: number;

  /**
   * 总下载大小（字节）
   */
  totalDownloadSize: number;

  /**
   * 资源数量
   */
  resourceCount: number;
};

/**
 * 资源加载性能接口
 */
export interface ResourceMetrics {
  /**
   * 资源URL
   */
  url: string;

  /**
   * 资源类型
   */
  initiatorType: string;

  /**
   * 资源大小
   */
  size: number;

  /**
   * 开始加载时间
   */
  startTime: number;

  /**
   * 响应结束时间
   */
  responseEnd: number;

  /**
   * 加载持续时间
   */
  duration: number;

  /**
   * DNS查询时间
   */
  dnsTime?: number;

  /**
   * TCP连接时间
   */
  tcpTime?: number;

  /**
   * SSL握手时间
   */
  sslTime?: number;

  /**
   * 请求时间
   */
  requestTime?: number;

  /**
   * 响应时间
   */
  responseTime?: number;

}
/**
 * 网络请求性能接口
 */

export interface NetworkMetrics {
  /**
   * 请求URL
   */
  url: string;

  /**
   * 请求方法
   */
  method: string;

  /**
   * 请求类型：xhr 或 fetch
   */
  type?: 'xhr' | 'fetch';

  /**
   * 状态码
   */
  status?: number;

  /**
   * 请求开始时间
   */
  startTime: number;

  /**
   * 请求结束时间
   */
  endTime: number;

  /**
   * 请求持续时间
   */
  duration: number;

  /**
   * 请求是否成功
   */
  success: boolean;

  /**
   * 错误信息
   */
  errorMessage?: string;

  /**
   * 请求大小
   */
  requestSize?: number;

  /**
   * 响应大小
   */
  responseSize?: number;

  /**
   * 请求头
   */
  requestHeaders?: Record<string, string>;
  
  /**
   * 响应头
   */
  responseHeaders?: Record<string, string>;
}
export type PerformanceFilterRule = (performanceInfo: PerformanceInfo) => boolean;

/**
 * 性能监控插件配置选项
 */
export interface PerformancePluginOptions {
  /**
   * 是否监控页面加载性能
   */
  pageLoadMetrics?: boolean;

  /**
   * 是否监控资源加载性能
   */
  resourceMetrics?: boolean;

  /**
   * 是否监控网络请求性能
   */
  networkMetrics?: boolean;

  /**
   * 是否监控交互性能
   */
  interactionMetrics?: boolean;

  /**
   * 是否监控长任务
   */
  longTaskMetrics?: boolean;

  /**
   * 是否监控内存使用
   */
  memoryMetrics?: boolean;

  /**
   * 是否监控帧率
   */
  fpsMetrics?: boolean;

  /**
   * 采样率，范围0-1
   */
  samplingRate?: number;

  /**
   * 资源性能采样率，范围0-1
   */
  resourceSamplingRate?: number;

  /**
   * 性能数据上报间隔（毫秒）
   */
  reportInterval?: number;

  /**
   * 最大性能数据缓存数量
   */
  maxBufferSize?: number;

  /**
   * 忽略的性能指标列表，支持字符串和正则表达式
   */
  ignoreMetrics?: Array<string | RegExp>;

  /**
   * 自定义过滤规则
   */
  rules?: PerformanceFilterRule[];
}

/**
 * 性能监控插件默认配置
 */
export const defaultPerformancePluginOptions: PerformancePluginOptions = {
  pageLoadMetrics: true,
  resourceMetrics: true,
  networkMetrics: true,
  interactionMetrics: true,
  longTaskMetrics: false,
  memoryMetrics: false,
  fpsMetrics: false,
  samplingRate: 1,
  resourceSamplingRate: 0.5,
  reportInterval: 5000,
  maxBufferSize: 100,
  ignoreMetrics: [],
  rules: []
};

export interface SDK {
  isStarted(): boolean;
  on(event: string, handler: () => void): void;
  send(data: any): void;
}

export interface Plugin {
  install(sdk: SDK): void;
}

/**
 * 性能处理器接口
 */
export interface PerformanceHandler {
  processResourceEntries: any;
  /**
   * 处理器名称
   */
  name: string;
  
  /**
   * 初始化处理器
   * @param context 上下文对象
   */
  init?(context: any): void;
  
  /**
   * 处理性能数据
   * @param data 性能数据
   */
  handle?(data: any): void;
  
  /**
   * 发送事件
   * @param eventType 事件类型
   * @param data 事件数据
   * @param context 上下文对象
   */
  sendEvent?(eventType: string, data: any, context: any): void;
}

/**
 * 资源计时数据类型
 */
export interface ResourceTimingData {
  /**
   * 资源名称（URL）
   */
  name: string;
  
  /**
   * 资源初始化类型
   */
  initiatorType: string;
  
  /**
   * 资源加载耗时（ms）
   */
  duration: number;
  
  /**
   * 资源请求发起时间（ms）
   */
  fetchStart: number;
  
  /**
   * 域名解析开始时间（ms）
   */
  domainLookupStart: number;
  
  /**
   * 域名解析结束时间（ms）
   */
  domainLookupEnd: number;
  
  /**
   * 连接开始时间（ms）
   */
  connectStart: number;
  
  /**
   * 连接结束时间（ms）
   */
  connectEnd: number;
  
  /**
   * 请求开始时间（ms）
   */
  requestStart: number;
  
  /**
   * 响应开始时间（ms）
   */
  responseStart: number;
  
  /**
   * 响应结束时间（ms）
   */
  responseEnd: number;
  
  /**
   * 是否为慢资源
   */
  isSlow: boolean;
  
  /**
   * 各阶段时间
   */
  timings?: {
    /**
     * DNS解析耗时（ms）
     */
    dns: number;
    
    /**
     * TCP连接耗时（ms）
     */
    tcp: number;
    
    /**
     * 首次响应耗时（ms）
     */
    ttfb: number;
    
    /**
     * 响应耗时（ms）
     */
    response: number;
    
    /**
     * 总耗时（ms）
     */
    total: number;
  };
}