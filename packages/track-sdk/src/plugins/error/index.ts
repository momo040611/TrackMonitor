import type { TrackerPlugin } from "../../core";

export interface ErrorPluginOptions {
    // 预留：比如是否捕获资源错误、Promise 错误等
}

export function createErrorPlugin(_options: ErrorPluginOptions = {}): TrackerPlugin {
    return {
        name: "error",
        setup() {
            // 初始化错误监听（window.onerror / unhandledrejection 等）
        },
        onEvent() {
            // 错误事件处理入口
        },
    };
}
