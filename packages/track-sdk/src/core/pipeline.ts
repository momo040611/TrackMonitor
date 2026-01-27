import type { TrackerEvent, TrackerPlugin, CoreContext } from "./types";

export class Pipeline {
    private plugins: TrackerPlugin[] = [];
    private context: CoreContext;

    constructor(context: CoreContext = {}) {
        this.context = context;
    }

    use(plugin: TrackerPlugin): void {
        this.plugins.push(plugin);
        if (plugin.setup) {
            plugin.setup(this.context);
        }
    }

    emit(event: TrackerEvent): void {
        for (const plugin of this.plugins) {
            if (plugin.onEvent) {
                try {
                    plugin.onEvent(event, this.context);
                } catch {
                    // 插件内部错误隔离，避免影响主流程
                }
            }
        }
    }
}
