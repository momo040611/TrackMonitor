import type { TrackerPlugin } from "../../core";
import type { TrackerEvent, CoreContext } from "../../core/types";
import { createPerformanceMonitor } from "./PerformanceMonitor";

export interface PerformancePluginOptions {
    enablePageLoadMetrics?: boolean;
    enableResourceMetrics?: boolean;
    sampleRate?: number; // 采样率（0-1）
}

export function createPerformancePlugin(options: PerformancePluginOptions = {}): TrackerPlugin {
    const {
        enablePageLoadMetrics = true,
        enableResourceMetrics = true,
        sampleRate = 1,
    } = options;

    const monitor = createPerformanceMonitor({
        enablePageLoadMetrics,
        enableResourceMetrics,
    });

    return {
        name: "performance",

        setup(context: CoreContext): void {
            // 检查采样率
            if (Math.random() > sampleRate) {
                return;
            }

            // 初始化性能监控
            monitor.init(context);
        },

        onEvent(event: TrackerEvent, context: CoreContext): void {
            // 处理性能相关事件
            if (event.type.startsWith("performance:")) {
                // 可以在这里添加额外的处理逻辑
                console.log("Performance event:", event);
            }
        },
    };
}



/**
代码说明 ：

- 实现了 TrackerPlugin 接口，与核心埋点系统集成
- 集成了之前创建的 PerformanceMonitor ，管理其生命周期
- 提供了插件配置选项，包括各种性能指标的开关和采样率控制
- 在 setup 方法中根据采样率决定是否初始化监控
- 在 onEvent 方法中处理性能相关事件
*/