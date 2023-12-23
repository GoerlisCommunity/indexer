import { BaseCollector } from "./BaseCollector";

export class CollectorManager {
    collectors: Map<string, BaseCollector> = new Map()

    constructor() {
    }

    register(cols: BaseCollector[]) {
        cols.forEach(c => {
            this.collectors.set(c.task, c)
        })
    }

    getCollector<T extends BaseCollector>(col: new (...args: any[]) => T): T {
        const collectorName = col.name;
        return this.collectors.get(collectorName) as T;
    }

    getAllCollectorName(): string[] {
        return Array.from(this.collectors.values()).map(v => v.task)
    }

    startAll() {
        this.collectors.forEach((v, k) => v.start())
    }
}
