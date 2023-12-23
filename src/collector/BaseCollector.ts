import debug from "debug";
import { In, EntityManager } from "typeorm";
import { Checkpoint } from "../entity/Checkpoint";
import { dataSource, delay } from "../index";

export interface CollectorConfig {
    interval: number;
    blockNumberThreshold: number;
}

export function transformAddress(a: string): string {
    return `\\x${a.slice(2)}`
}

export abstract class BaseCollector {
    log: debug.Debugger;
    err: debug.Debugger;
    lastCheckpoint: Checkpoint;

    constructor(public task: string, public dependOnCkpt: string[], public collectorConfig: CollectorConfig) {
        this.log = debug(`indexer:collector:${task}:log`);
        this.log.log = console.log;
        this.err = debug(`indexer:collector:${task}:err`);
    }

    abstract getInitialCheckpoint(): Promise<number>

    async getLastCheckpoint(): Promise<number> {
        if (!this.lastCheckpoint) {
            const ckpt = await dataSource.manager.findOne(Checkpoint, { where: { ckpt: this.task } });
            if (!ckpt) {
                this.lastCheckpoint = new Checkpoint();
                this.lastCheckpoint.ckpt = this.task;
                this.lastCheckpoint.blocknumber = await this.getInitialCheckpoint();
            } else {
                this.lastCheckpoint = ckpt;
            }
        }
        return this.lastCheckpoint.blocknumber;
    }

    async getNextCheckpoint(): Promise<number> {
        let nextCheckpoint = this.lastCheckpoint.blocknumber + this.collectorConfig.blockNumberThreshold;
        const checkpoints = await dataSource.manager.find(Checkpoint, { where: { ckpt: In(this.dependOnCkpt) } });
        if (checkpoints.length != this.dependOnCkpt.length) {
            return -1;
        }
        for (const checkpoint of checkpoints) {
            nextCheckpoint = Math.min(nextCheckpoint, checkpoint.blocknumber);
        }
        return nextCheckpoint;
    }

    abstract process(lastCheckpoint: number, nextCheckpoint: number, manager: EntityManager): Promise<void>;

    async updateCheckpoint(newestBlockNumber: number, manager: EntityManager) {
        this.lastCheckpoint.blocknumber = newestBlockNumber;
        await manager
            .createQueryBuilder()
            .insert()
            .into(Checkpoint)
            .values(this.lastCheckpoint)
            .orUpdate(["blocknumber"], ["ckpt"])
            .execute();
    }

    async start() {
        const interval = this.collectorConfig.interval;
        while (true) {
            try {
                let lastCheckPoint = -1;
                let nextCheckPoint = -1;
                while (lastCheckPoint == -1 || nextCheckPoint == -1 || nextCheckPoint < lastCheckPoint) {
                    lastCheckPoint = await this.getLastCheckpoint();
                    nextCheckPoint = await this.getNextCheckpoint();
                    this.log(`Get ckpt last ${lastCheckPoint} next ${nextCheckPoint}`)
                    if (lastCheckPoint == -1 || nextCheckPoint == -1 || nextCheckPoint < lastCheckPoint) {
                        this.log(`Failed to validate checkpoint, waiting`)
                        await delay(500)
                    }
                }
                if (nextCheckPoint >= lastCheckPoint) {
                    await dataSource.manager.transaction(async (manager) => {
                        await this.process(lastCheckPoint, nextCheckPoint, manager);
                        await this.updateCheckpoint(nextCheckPoint + 1, manager);
                        this.log(`collected data from ${lastCheckPoint} to ${nextCheckPoint}`)
                    });
                } else {
                    await this.updateCheckpoint(nextCheckPoint + 1, dataSource.manager);
                }
                await delay(interval);
            } catch (e) {
                this.err(e);
                await delay(interval);
            }
        }
    }
}
