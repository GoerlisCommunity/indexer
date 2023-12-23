import { err, init, log } from "./index";
import { GoerliTxSyncer, MainnetTxSyncer } from "./syncer/syncers";
import { StaticJsonRpcProvider } from "./StaticJsonRpcProvider";
import { goerliConfig, mainnetConfig } from "./config";

async function main() {
  log(`Goerlis Indexer https://github.com/GoerlisCommunity/indexer`)
  log(`This program is licensed under AGPL 3.0`)
  log(`Copyright (C) 2023 Goerlis Community Contributors`)
  await init()

  new GoerliTxSyncer({
    interval: 1000,
    rpc: new StaticJsonRpcProvider(process.env.RPC_GOERLI)
  }, goerliConfig).start()

  new MainnetTxSyncer({
    interval: 1000,
    rpc: new StaticJsonRpcProvider(process.env.RPC_MAINNET)
  }, mainnetConfig).start()
}

main().catch(e => {
  err(e)
  process.exit(1)
})

process.once("SIGINT", () => {
  log("SIGINT received. Shutting down updater.")
  process.exit(0)
})
