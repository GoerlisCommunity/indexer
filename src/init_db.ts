import { databaseConfig, err, log } from "./index";
import { DataSource } from "typeorm";

async function main() {
    log("initializing database")

    // @ts-ignore
    databaseConfig["logging"] = true
    // @ts-ignore
    databaseConfig["synchronize"] = true

    log("trying to sync entities")
    const d1 = new DataSource(databaseConfig)
    await d1.initialize()
    try {
        await d1.query(`delete
                        from migrations`)
    } catch (e) {
        err(e)
    }
    log("synced entities")
    await d1.destroy()

    // // @ts-ignore
    // databaseConfig["synchronize"] = false
    // // @ts-ignore
    // databaseConfig["migrationsRun"] = true
    // log("trying to run migrations")
    // const d2 = new DataSource(databaseConfig)
    // await d2.initialize()
    // log("migrations completed")
    // await d2.destroy()

    log("done")
}

main().catch(e => {
    err(e)
    process.exit(1)
})
