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
                } catch (e) {
                    console.error('[SDK Error] Plugin execution failed:', e);
                }
            }
        }
    }
}
