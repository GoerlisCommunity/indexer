import { err, init, log } from "./index";
import { GoerliInscriptionCollector, MainnetInscriptionCollector } from "./collector/InscriptionCollector";
import { goerliConfig, mainnetConfig } from "./config";

async function main() {
    await init()

    new GoerliInscriptionCollector({
        interval: 100,
        blockNumberThreshold: 100
    }, goerliConfig).start()
    new MainnetInscriptionCollector({
        interval: 100,
        blockNumberThreshold: 100
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

