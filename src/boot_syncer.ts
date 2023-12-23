import { err, init, log } from "./index";
import { GoerliTxSyncer } from "./syncer/syncers";
import { StaticJsonRpcProvider } from "./StaticJsonRpcProvider";

async function main() {
  log(`Goerlis Indexer https://github.com/GoerlisCommunity/indexer`)
  log(`This program is licensed under AGPL 3.0`)
  log(`Copyright (C) 2023 Goerlis Community Contributors`)
  await init()

  new GoerliTxSyncer("GoerliSyncer", {
    confirmation: 5,
    interval: 1000,
    startBlock: 10257602,
    rpc: new StaticJsonRpcProvider(process.env.RPC_GOERLI)
  }).start()
}

main().catch(e => {
  err(e)
  process.exit(1)
})

process.once("SIGINT", () => {
  log("SIGINT received. Shutting down updater.")
  process.exit(0)
})
