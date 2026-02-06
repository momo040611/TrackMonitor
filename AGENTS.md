# AGENTS

## Track SDK Skills

### Skill: 了解 track-sdk 的架构和 TypeScript 规范

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

### Skill: 在前端项目中安装并初始化 track-sdk

## 适用场景

- 项目是一个前端应用（如 React / Vue / 其他基于打包工具的 SPA）。
- 需要在项目中集成埋点 SDK，用于行为、性能、错误等监控。
- 当前项目尚未接入 `track-sdk`，或希望按推荐方式重新接入。

本 Skill 目标：

- 安装 `track-sdk` 依赖。
- 在项目入口文件中创建并导出一个全局 `tracker` 实例。
- 注册内置插件：行为、性能、错误。

---

## 前置条件检查

1. **检查是否已安装 track-sdk：**
   - 打开 `package.json`，在 `dependencies` 或 `devDependencies` 中查找 `"track-sdk"`。
   - 如果未找到，则需要在后续步骤中安装。

2. **确定项目入口文件位置：**
   - 常见入口文件路径（按优先级从上到下尝试）：
     - `src/main.tsx`
     - `src/main.ts`
     - `src/index.tsx`
     - `src/index.ts`
   - 如果以上路径都不存在，应提示用户手动指定入口文件，而不是盲目创建新文件。

---

## 步骤一：安装依赖

根据项目使用的包管理工具安装 `track-sdk`。

- 如果项目使用 **pnpm**：

  ```bash
  pnpm add track-sdk
  ```

- 如果项目使用 **npm**：

  ```bash
  npm install track-sdk
  ```

- 如果项目使用 **yarn**：

  ```bash
  yarn add track-sdk
  ```

> 在 AI Coding Agent 中使用时，应先检查 `pnpm-lock.yaml` / `package-lock.json` / `yarn.lock` 等文件来推测当前项目使用的包管理器，避免混用。

---

## 步骤二：在入口文件中初始化 tracker

> 以下以典型的 React/Vite 项目为例，其他框架可参考同样的初始化思路：在应用渲染之前创建并导出一个全局 `tracker` 实例。

1. **在入口文件顶部导入 SDK 及插件：**

   ```ts
   import { createTracker } from 'track-sdk'
   import { createBehaviorPlugin } from 'track-sdk/plugins/behavior'
   import { createPerformancePlugin } from 'track-sdk/plugins/performance'
   import { createErrorPlugin } from 'track-sdk/plugins/error'
   ```

2. **创建并导出全局 `tracker` 实例：**

   建议在入口文件中添加如下代码，确保只初始化一次：

   ```ts
   export const tracker = createTracker({
     appId: 'REPLACE_WITH_REAL_APP_ID', // TODO: 由接入方填入真实应用 ID
     plugins: [createBehaviorPlugin(), createPerformancePlugin(), createErrorPlugin()],
   })
   ```

3. **确保 `tracker` 在业务代码中可复用：**
   - 在业务组件或其他模块中，需要使用埋点时，应从同一个入口模块导入 `tracker`，例如：

     ```ts
     import { tracker } from '../main' // 路径根据实际入口文件调整

     tracker.track('button_click', {
       position: 'header',
     })
     ```

   - 避免在多个不同文件中重复调用 `createTracker`，以免产生多个实例。

---

## 步骤三：验证集成是否成功

1. **添加简单的测试埋点：**

   在首页或某个按钮点击中添加一个测试事件：

   ```ts
   tracker.track('sdk_init_test', {
     env: process.env.NODE_ENV,
   })
   ```

2. **控制台确认：**

   在 `createTracker` 的实现或初始化阶段，可以打印一条日志（如果 SDK 内部尚未实现，可临时在接入代码中添加）：

   ```ts
   console.log('[track-sdk] tracker initialized')
   ```

3. **后续接入监控服务时**，应能在后台看到对应的事件上报记录。

---

## AI Coding Agent 使用注意事项

- 在修改入口文件时：
  - 避免破坏现有的渲染逻辑（如 ReactDOM 创建根节点、Vue 应用挂载等）。
  - 优先在文件顶部添加 import，在渲染逻辑前初始化 `tracker`。

- 在业务代码中添加埋点时：
  - 始终从统一出口导入 `tracker`，不要在业务模块中再次调用 `createTracker`。
  - 事件名应语义化，例如：`page_view_home`, `button_click_submit` 等。

- 如果项目已经存在其他埋点 SDK：
  - 在注释中提醒用户可能存在重复上报或冲突，必要时请用户确认后再自动插入代码。

- 如果无法自动识别入口文件或包管理器：
  - 不要强行创建新的入口文件或随意选择安装命令。
  - 应明确提示用户手动指定入口文件路径或使用的包管理工具。
