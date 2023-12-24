import { BaseCollector, CollectorConfig } from "./BaseCollector";
import { EthTransaction, GoerliTransaction, MainnetTransaction } from "../entity/EthTransaction";
import { ChainConfig } from "../config";
import { Between, EntityManager } from "typeorm";
import { ContentType, GoerliInscription, Inscription, MainnetInscription, Subprotocol } from "../entity/Inscription";

export type Grc20Inscription = {
    p: string
    op: string
    tick: string
    [key: string]: string
}

export abstract class InscriptionCollector<T extends EthTransaction, S extends Inscription> extends BaseCollector {
    constructor(public collectorConfig: CollectorConfig, public chainConfig: ChainConfig) {
        super(`${chainConfig.name}InscriptionCollector`, [`${chainConfig.name}TxSyncer`],
            collectorConfig)
    }

    async getInitialCheckpoint(): Promise<number> {
        return this.chainConfig.startBlock
    }

    abstract getTxs(from: number, to: number, man: EntityManager): Promise<T[]>

    abstract createInscription() : S

    abstract saveInscriptions(i: S[], man: EntityManager): Promise<void>

    async process(lastCheckpoint: number, nextCheckpoint: number, manager: EntityManager) {
        const txs = await this.getTxs(lastCheckpoint, nextCheckpoint, manager)

        if (txs.length > 0) {
            this.log(`Processing ${txs.length} transactions`)

            const inscriptions: S[] = []
            for (const tx of txs) {
                try {
                    const segments = tx.calldata.split(/,(.+)?/, 2)
                    const t = segments[0].split(/:/, 2)
                    const contentType = t[1] == "" ? "application/json" : t[1]
                    if (tx.blockNumber >= this.chainConfig.contentType[contentType]) {
                        const data: Grc20Inscription = JSON.parse(segments[1])
                        if (data.p == "grc-20" && tx.blockNumber >= this.chainConfig.subprotocol["grc-20"].opcode[data.op]) {
                            const i = this.createInscription()
                            i.contentType = ContentType.APPLICATION_JSON
                            i.subprotocol = Subprotocol.GRC20
                            i.blockNumber = tx.blockNumber
                            i.transactionHash = tx.transactionHash
                            i.txIndex = tx.txIndex
                            i.address = tx.address
                            i.content = segments[1]
                            inscriptions.push(i)
                        }
                    }
                } catch (e) {
                    this.err(`Failed to process ${tx.transactionHash}`)
                }
            }
            this.log(`Processed ${inscriptions.length} inscriptions`)
            await this.saveInscriptions(inscriptions, manager)
        }
    }
}

export class GoerliInscriptionCollector extends InscriptionCollector<GoerliTransaction, GoerliInscription> {
    async getTxs(from: number, to: number, man: EntityManager): Promise<GoerliTransaction[]> {
        return man.find(GoerliTransaction, {
            where: {
                blockNumber: Between(from, to)
            },
            order: {
                blockNumber: "ASC",
                txIndex: "ASC"
            }
        })
    }

    createInscription(): GoerliInscription {
        return new GoerliInscription()
    }

    async saveInscriptions(i: GoerliInscription[], man: EntityManager) {
        await man.createQueryBuilder()
            .insert()
            .into(GoerliInscription)
            .values(i)
            .orIgnore()
            .execute()
    }
}

export class MainnetInscriptionCollector extends InscriptionCollector<MainnetTransaction, MainnetInscription> {
    async getTxs(from: number, to: number, man: EntityManager): Promise<MainnetTransaction[]> {
        return man.find(MainnetTransaction, {
            where: {
                blockNumber: Between(from, to)
            },
            order: {
                blockNumber: "ASC",
                txIndex: "ASC"
            }
        })
    }

    createInscription(): MainnetInscription {
        return new MainnetInscription()
    }

    async saveInscriptions(i: MainnetInscription[], man: EntityManager) {
        await man.createQueryBuilder()
            .insert()
            .into(MainnetInscription)
            .values(i)
            .orIgnore()
            .execute()
    }
}
