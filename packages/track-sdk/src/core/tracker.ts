import { Pipeline } from "./pipeline";
import type { CoreContext, TrackerEvent, TrackerPlugin } from "./types";

export interface TrackerOptions {
    context?: CoreContext;
}

export class Tracker {
    private pipeline: Pipeline;

    constructor(options: TrackerOptions = {}) {
        this.pipeline = new Pipeline(options.context ?? {});
    }

    use(plugin: TrackerPlugin): this {
        this.pipeline.use(plugin);
        return this;
    }

    track(type: string, payload?: unknown): void {
        const event: TrackerEvent = {
            type,
            payload,
            timestamp: Date.now(),
        };
        this.pipeline.emit(event);
    }
}

export function createTracker(options?: TrackerOptions): Tracker {
    return new Tracker(options);
}
