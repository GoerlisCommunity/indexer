import { DataSource, DataSourceOptions } from "typeorm";
import debug from "debug";
import { StaticJsonRpcProvider } from "./StaticJsonRpcProvider";
import { types } from "pg";
import { configDotenv } from "dotenv";
import { ethers } from "ethers";
import { CollectorConfig } from "./collector/BaseCollector";
import { CollectorManager } from "./collector/CollectorManager";

types.setTypeParser(types.builtins.NUMERIC, (val) => BigInt(val));
// Only for block number
types.setTypeParser(types.builtins.INT8, (val) => Number(val));
// for address type
types.setTypeParser(types.builtins.BYTEA, (val) => `0x${val.slice(2)}`);

configDotenv();

export const extraConfig: Partial<DataSourceOptions> = process.env.PGSQL_SSL === "true" ? {
    ssl: {
        rejectUnauthorized: false,
    },
} : {}

export const databaseConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.PGSQL_HOST,
    port: Number(process.env.PGSQL_PORT),
    username: process.env.PGSQL_USERNAME,
    // @ts-ignore
    password: process.env.PGSQL_PASSWORD,
    database: process.env.PGSQL_DATABASE,
    entityPrefix: "gors_",
    entities: [__dirname + "/entity/**/*.{ts,js}"],
    migrations: [__dirname + "/migration/**/*.{ts,js}"],
    ...extraConfig
};

export const dataSource = new DataSource(databaseConfig);

export const log = debug(`indexer:syncer:log`);
log.log = console.log;
export const err = debug(`indexer:syncer:err`);
export let shutdown = false;

export async function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export async function init() {
    log(`initializing database`);
    await dataSource.initialize();
    log(`initialized database`);
}

export const collectorManager = new CollectorManager()

export function registerCollectors() {
    collectorManager.register([
    ])
}

