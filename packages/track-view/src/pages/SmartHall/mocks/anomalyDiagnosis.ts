import type { DiagnosisItem } from '../types'

/**
 * 默认异常诊断数据
 * 当后端服务不可用时使用这些默认数据
 */
export const DEFAULT_ISSUES: DiagnosisItem[] = [
  {
    id: '1',
    level: 'error',
    title: 'generate_click 事件参数缺失',
    description: '检测到 5% 的生成点击事件缺失 model_type 参数。',
    suggestion: '请检查 TrackSDK 的调用代码，确保 payload 中包含 model_type 字段。',
    affected_scope: 'A/B 测试实验组 B',
    score_impact: 15,
  },
  {
    id: '2',
    level: 'warning',
    title: 'work_show 曝光未去重',
    description: '同一作品 ID 在短时间内触发了多次曝光。',
    suggestion: '建议引入防抖 (Debounce) 机制，或使用 SDK 的 once: true 选项。',
    score_impact: 5,
  },
  {
    id: '3',
    level: 'info',
    title: 'Prompt 长度分布异常',
    description: '检测到超长 Prompt (Length > 1000) 占比上升。',
    suggestion: '业务提示，暂无需代码修复。',
    score_impact: 0,
  },
]
