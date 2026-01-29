import type { TrackerPlugin } from "../../core";

export interface BehaviorPluginOptions {
    // 预留：比如需要的采集配置
}

export function createBehaviorPlugin(_options: BehaviorPluginOptions = {}): TrackerPlugin {
    return {
        name: "behavior",
        setup() {
            // 初始化行为采集，比如绑定全局事件监听等

        },
        onEvent() {
            // 行为事件处理入口
        },
    };
}
