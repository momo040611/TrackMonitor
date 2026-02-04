import type { PerformanceHandler } from "../types";
import { PageLoadMetricsHandler } from "./page-load-metrics";
import { createResourceMetricsHandler } from "./resource-metrics";

export interface HandlerManagerOptions {
    enablePageLoadMetrics?: boolean;  // 是否启用页面加载性能监控
    enableResourceMetrics?: boolean;  // 是否启用资源性能监控
}

export class HandlerManager {
    private handlers: PerformanceHandler[] = []; //handlers: 存储所有性能监控处理器的数组

    constructor(options: HandlerManagerOptions = {}) {
        const {
            enablePageLoadMetrics = true,
            enableResourceMetrics = true,
        } = options;

        // 注册处理器
        if (enablePageLoadMetrics) {
            this.registerHandler(createPageLoadMetricsHandler());
        }

        if (enableResourceMetrics) {
            this.registerHandler(createResourceMetricsHandler());
        }
    }

    /**
     * 注册处理器
     */
    registerHandler(handler: PerformanceHandler): void {
        this.handlers.push(handler); // 注册性能监控处理器,添加到 handlers 数组中
    }

    /**
     * 初始化所有处理器
     */
    init(context: any): void {
        this.handlers.forEach(handler => {
            handler.init?.(context);  // 初始化处理器,调用处理器的 init 方法(有init方法就调用它)
        });
    }

    /**
     * 获取所有处理器
     */
    getHandlers(): PerformanceHandler[] {
        return this.handlers; // 返回当前实例中存储的处理器数组
    }
}

export function createHandlerManager(options?: HandlerManagerOptions): HandlerManager {
    return new HandlerManager(options);   // 创建并返回 HandlerManager 实例,使用实例更简单
}




function createPageLoadMetricsHandler(): PerformanceHandler {
    throw new Error("Function not implemented.");
}
// - 创建了 HandlerManager 类来管理所有性能处理器
// - 提供了处理器注册、初始化和获取的方法
// - 支持通过配置选项启用或禁用特定类型的处理器
// - 作为一个容器，将不同类型的处理器整合在一起，方便性能监控器统一管理