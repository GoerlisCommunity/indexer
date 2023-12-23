import { Server } from "@hapi/hapi"
import debug from "debug";
import { init } from "./index";
import { initServer } from "./api/IndexerApi";

export let server: Server

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});

export const log = debug(`indexer:api`)
log.log = console.log

async function main() {
    log(`Goerlis Indexer https://github.com/GoerlisCommunity/indexer`)
    log(`This program is licensed under AGPL 3.0`)
    log(`Copyright (C) 2023 Goerlis Community Contributors`)
    await init()
    server = await initServer()

    await server.start()
    log(`Server has been started`)
}

main().catch(e => console.error(e))
