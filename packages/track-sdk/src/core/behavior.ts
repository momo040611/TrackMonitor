import { getCommonContext, trackEvent } from './tracker';

// 行为事件名
export type BehaviorEventNames =
  | 'page_view'
  | 'work_show'
  | 'work_click'
  | 'generate_click'
  | 'button_click';

// 行为事件参数定义
export interface PageViewEvent {
  page_name: string;
  page_url?: string;
  referrer?: string;
}

export interface WorkShowEvent {
  page_name: string;
  work_id: string;
  index?: number;
  list_id?: string;
}

export interface WorkClickEvent {
  page_name: string;
  work_id: string;
  index?: number;
  list_id?: string;
}

export interface GenerateClickEvent {
  page_name: string;
  entry_point: string;
  model_type?: string;
  prompt_length?: number;
}

export interface ButtonClickEvent {
  page_name: string;
  button_name: string;
  button_text?: string;
  position?: string;
}

// 事件名 -> 参数类型映射
export interface BehaviorEventMap {
  page_view: PageViewEvent;
  work_show: WorkShowEvent;
  work_click: WorkClickEvent;
  generate_click: GenerateClickEvent;
  button_click: ButtonClickEvent;
}

/**
 * 行为埋点统一入口（手动埋点使用）
 */
export function trackBehavior<T extends BehaviorEventNames>(
  eventName: T,
  params: BehaviorEventMap[T]
): void {
  const context = getCommonContext();
  const payload = {
    ...context,
    ...params,
  };
  trackEvent(eventName, payload);
}