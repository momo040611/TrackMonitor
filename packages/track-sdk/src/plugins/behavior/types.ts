/**
 * 行为埋点事件参数定义
 */

// 1. 页面浏览
export interface PageViewEvent {
    page_name: string;   // 页面名称语义，如 'inspiration_feed'
    page_url?: string;   // 路由路径，如 '/feed'
    referrer?: string;   // 前一页面路径
}

// 2. 作品曝光
export interface WorkShowEvent {
    page_name: string;
    work_id: string;     // 作品 ID
    index?: number;      // 在列表中的序号
    list_id?: string;    // 列表标识，如 'inspiration_feed'
}

// 3. 作品点击
export interface WorkClickEvent {
    page_name: string;
    work_id: string;
    index?: number;
    list_id?: string;
}

// 4. 生成点击 
export interface GenerateClickEvent {
    page_name: string;
    entry_point: string; // 入口标识，如 'detail_generate_button'
    model_type?: string; // 模型类型，如 'sdxl' / 'flux'
    prompt_length?: number; // prompt 文本长度
}

// 5. 通用点击
export interface ButtonClickEvent {
    page_name: string;
    button_name: string; // 按钮业务名称，如 'save_work'
    button_text?: string;// 按钮显示文案
    position?: string;   // 按钮所在区域，如 'header' / 'footer'
}

// 事件名 -> 参数类型映射
export interface BehaviorEventMap {
    page_view: PageViewEvent;
    work_show: WorkShowEvent;
    work_click: WorkClickEvent;
    generate_click: GenerateClickEvent;
    button_click: ButtonClickEvent;
}

// 行为事件名联合类型
export type BehaviorEventNames =
    | 'page_view'
    | 'work_show'
    | 'work_click'
    | 'generate_click'
    | 'button_click';