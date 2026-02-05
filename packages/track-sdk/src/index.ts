export * from "./core";
export * from "./plugins/behavior";
export * from "./plugins/error";
export * from "./plugins/performance";
export * from "./plugins/sender";

// 初始化函数
import { createTracker } from "./core";
import { createBehaviorPlugin } from "./plugins/behavior";
import { createErrorPlugin } from "./plugins/error";
import { createPerformancePlugin } from "./plugins/performance";
import { SenderPlugin } from "./plugins/sender";

// 定义一个配置接口，方便用户传参
export interface InitOptions {
  appName: string;
  reportUrl: string;
  // ... 其他你想要的配置
}

export function initSDK(options: InitOptions) {
  const { appName, reportUrl } = options;

  // 创建 Tracker 实例
  const tracker = createTracker({
    context: { appName }
  });

  // 统一组装所有插件
  // 这里的关键是：你在内部帮用户解决了 "怎么传 tracker" 的问题
  // 用户不需要知道 PerformancePlugin 需要 tracker，你帮他传了
  tracker
    .use(createBehaviorPlugin({ tracker }))      // 传递 tracker 实例
    .use(createErrorPlugin({ tracker }))         // 传递 tracker 实例
    .use(createPerformancePlugin({ tracker }))   // 传递 tracker 实例
    .use(new SenderPlugin({ url: reportUrl }));  // Sender 不需要 tracker

  return tracker;
}