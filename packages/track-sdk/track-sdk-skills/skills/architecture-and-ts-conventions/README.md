# Skill: 了解 track-sdk 的架构和 TypeScript 规范

## 1. SDK 总体架构

- **包名称**：`track-sdk`
- **技术栈**：TypeScript，Rollup 打包（按实际情况修改）
- **核心模块**：
  - `core`：提供 `Tracker` 核心实例和事件分发能力
  - `plugins`：插件系统（行为、性能、错误等）
  - `src/index.ts`：对外导出统一入口

### 1.1 Tracker 核心

- 核心概念：`Tracker` 负责接收埋点事件，并把事件分发给已注册的插件。
- 常见初始化方式（示例形态，具体 API 以实际代码为准）：

  ```ts
  import { createTracker } from 'track-sdk'
  import { createBehaviorPlugin } from 'track-sdk/plugins/behavior'
  import { createPerformancePlugin } from 'track-sdk/plugins/performance'
  import { createErrorPlugin } from 'track-sdk/plugins/error'

  export const tracker = createTracker({
    appId: 'REPLACE_WITH_REAL_APP_ID',
    plugins: [createBehaviorPlugin(), createPerformancePlugin(), createErrorPlugin()],
  })
  ```

### 1.2 插件系统

- 插件统一实现 `TrackerPlugin` 接口（来自 `core`）：

  ```ts
  import type { TrackerPlugin } from 'track-sdk'

  export interface TrackerPlugin {
    name: string
    setup?(): void
    onEvent?(event: unknown): void // 实际事件类型以 core 中定义为准
  }
  ```

- 内置插件（当前/目标设计）：
  - `behavior` 插件：采集用户行为，如点击、页面浏览等
  - `performance` 插件：采集性能指标，如首屏时间、LCP 等（逐步完善）
  - `error` 插件：采集前端错误信息（全局报错、Promise 未捕获等）

- 每个插件通常暴露一个 `createXxxPlugin` 工厂函数，例如（以性能插件为例）：

  ```ts
  import type { TrackerPlugin } from 'track-sdk'

  export interface PerformancePluginOptions {
    // 预留：比如是否自动打点首屏、LCP 等
  }

  export function createPerformancePlugin(_options: PerformancePluginOptions = {}): TrackerPlugin {
    return {
      name: 'performance',
      setup() {
        // 初始化性能监控（PerformanceObserver 等）
      },
      onEvent() {
        // 性能相关事件处理入口
      },
    }
  }
  ```

## 2. TypeScript 规范

在为 track-sdk 写代码或生成代码时，请遵守以下规范：

### 2.1 类型安全

- **避免使用 `any`**：
  - 优先使用 `unknown` + 类型守卫，或定义明确的接口。
- 对外导出的 API 必须有**显式类型注解**：
  - 函数参数、返回值都不要依赖类型推导。

示例：

```ts
export interface TrackEventPayload {
  [key: string]: unknown
}

export function track(eventName: string, payload?: TrackEventPayload): void {
  // ...
}
```

### 2.2 接口与类型命名

- 接口、类型使用 **PascalCase**，明确语义：
  - 如：`TrackerOptions`, `TrackerPlugin`, `PerformancePluginOptions`。
- 插件工厂函数统一以 `createXxxPlugin` 命名，例如：
  - `createBehaviorPlugin`
  - `createPerformancePlugin`
  - `createErrorPlugin`

### 2.3 模块与导出

- 所有公开给外部使用的类型和函数都应从统一入口导出：
  - 优先从 `src/index.ts` 再导出（当前已导出 `core` 及各插件）。
- 插件模块路径保持清晰、稳定：
  - `track-sdk/plugins/behavior`
  - `track-sdk/plugins/performance`
  - `track-sdk/plugins/error`

### 2.4 代码风格

- 使用 `strict` TypeScript 编译选项（`strict: true`）。
- 避免在插件内部直接访问全局变量：
  - 如需访问 `window` / `document`，先做环境检查（例如是否在浏览器端）。
- 新增字段或配置时，优先通过扩展 `Options` 接口，而不是硬编码字面量对象。

## 3. AI 在使用本 SDK 时的注意事项

- 在不确定具体 API 时，请**优先阅读项目中的类型定义文件**（`core`、`plugins/*`），再生成代码。
- 避免伪造还不存在的函数名/字段名：
  - 如果需要新能力，优先按现有设计模式扩展：
    - 新插件 → 新增 `createXxxPlugin(options): TrackerPlugin`
    - 新事件字段 → 扩展事件 payload 类型。
- 在业务项目中集成时：
  - 优先在项目入口文件初始化 `tracker`，并导出统一实例供业务层使用。
  - 避免在多个不同模块中重复创建 `Tracker` 实例。
