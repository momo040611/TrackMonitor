export type HandlerPeport = (eventName: string, payload?: unknown) => void;


/**
 * 生成唯一的 DOM 路径
 * 格式示例: body > div#app > section > button.btn-primary
 */
function getDomPath(element: HTMLElement): string {
    const stack: string[] = [];
    let el: HTMLElement | null = element;

    while (el && el !== document.body && el !== document.documentElement) {
        let str = el.tagName.toLowerCase();
        //如果有id，直接使用id
        if (el.id) {
            str += `#${el.id}`;
            stack.unshift(str);
            break;
        }
        //如果有class,追加class
        if (el.className && typeof el.className === "string") {
            const classNames = el.className.split(/\s+/).filter(c => c).join('.');
            if (classNames) {
                str += `.${classNames}`;
            }
        }
        stack.unshift(str);
        el = el.parentElement;
    }
    return stack.join(' > ');
}

/**
 * 判断元素是否是“交互元素” 
 */
function isInteractive(el: HTMLElement): boolean {
    const tagName = el.tagName;

    if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
        return true;
    }

    if (el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link') {
        return true;
    }

    try {
        const style = window.getComputedStyle(el);
        if (style.cursor === 'pointer') {
            return true;
        }
    } catch (e) {
        // 获取样式失败，不处理
    }

    return false;
}


/**
 * 自动获取元素内容
 */
function getElementContent(el: HTMLElement): string {
    const text = el.textContent?.trim();
    if (text) {
        return text.slice(0, 50);
    }

    const alt = el.getAttribute('alt');
    if (alt) return alt;

    const title = el.getAttribute('title');
    if (title) return title;

    return '';
}

/**
 * 初始化点击监听 
 */
export function initClickHandler(report: HandlerPeport): void {
    window.addEventListener('click', (event: MouseEvent) => {
        let target = event.target as HTMLElement;
        // 向上查找，直到找到交互元素或 body
        let trackEl: HTMLElement | null = null;

        while (target && target !== document.body && target !== document.documentElement) {

            // 优先处理显式声明了埋点的元素
            if (target.hasAttribute('data-track-name')) {
                trackEl = target;
                break;
            }

            if (isInteractive(target)) {
                trackEl = target;
                break;
            }
            target = target.parentElement as HTMLElement;
        }

        // 如果到 body 都没找到交互元素，则过滤掉
        if (!trackEl) {
            return;
        }
        //采集逻辑
        const explicitName = trackEl.getAttribute('data-track-name');

        //内容抓取
        const content = trackEl.getAttribute('data-track-text') || getElementContent(trackEl);

        // C. 路径记录
        const domPath = getDomPath(trackEl);


        // 事件上报
        const buttonName = explicitName || "auto_click";

        report('button_click', {
            page_name: window.location.pathname,
            button_name: buttonName,
            button_text: content,
            position: domPath,
        });

    }, true);
}
