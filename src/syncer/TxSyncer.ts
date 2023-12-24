import debug from "debug"
import { dataSource, delay } from ".."
import { Checkpoint } from "../entity/Checkpoint"
import { EntityManager } from "typeorm"
import { StaticJsonRpcProvider } from "../StaticJsonRpcProvider";
import { EthBlock } from "../entity/EthBlock";
import { EthTransaction } from "../entity/EthTransaction";
import { ChainConfig } from "../config";

export interface TxSyncerConfig {
    interval: number
    rpc: StaticJsonRpcProvider
}

export abstract class TxSyncer<B extends EthBlock, T extends EthTransaction> {
    log: debug.Debugger
    err: debug.Debugger
    ckpt: Checkpoint
    shutdown = true

    constructor(public tag: string, public config: TxSyncerConfig, public chainConfig: ChainConfig) {
        this.log = debug(`indexer:syncer:${tag}:log`)
        this.log.log = console.log
        this.err = debug(`indexer:syncer:${tag}:err`)
    }

    async getCurrentBlock(force: boolean = false): Promise<number> {
        if (!this.ckpt || force) {
            const ckpt = await dataSource.manager.findOne(Checkpoint, { where: { ckpt: this.tag } })
            if (ckpt) {
                this.ckpt = ckpt
            } else {
                this.ckpt = new Checkpoint()
                this.ckpt.ckpt = this.tag
                this.ckpt.blocknumber = this.chainConfig.startBlock
            }
        }
        return this.ckpt.blocknumber
    }

    async saveCurrentBlock(newBlk: number, man: EntityManager) {
        this.ckpt.blocknumber = newBlk
        await man.createQueryBuilder()
            .insert()
            .into(Checkpoint)
            .values(this.ckpt)
            .orUpdate(["blocknumber"], ["ckpt"])
            .execute()
    }

    abstract createBlock(): B

    abstract createTx(): T

    abstract saveBlock(b: B, man: EntityManager): Promise<void>

    abstract saveTxs(t: T[], man: EntityManager): Promise<void>

    async start() {
        this.log(`Detect network`)
        this.shutdown = false
        const network = await this.config.rpc.getNetwork()
        if (network.chainId != BigInt(this.chainConfig.chainId)) {
            this.err(`Invalid network. Expected chain id ${this.chainConfig.chainId}, actual ${network.chainId}`)
            return
        }
        while (!this.shutdown) {
            try {
                const currentBlock = await this.getCurrentBlock()
                const blockNum = await this.config.rpc.getBlockNumber()
                if (blockNum > currentBlock + this.chainConfig.confirmation) {
                    this.log(`Fetching block ${currentBlock}, current ${blockNum}, diff ${blockNum - currentBlock}`)
                    const block = (await this.config.rpc.getBlock(currentBlock, true))!
                    const txs = block.transactions

                    if (txs.length > 0) {
                        const ethBlock = this.createBlock()
                        ethBlock.blockNumber = block.number
                        ethBlock.timestamp = block.timestamp

                        const ethTxs: T[] = []
                        for (let i = 0; i < txs.length; ++i) {
                            const rawTx = block.getPrefetchedTransaction(i)
                            if (rawTx.from == rawTx.to && rawTx.data.startsWith("0x646174613a")) {
                                const tx = this.createTx()
                                tx.blockNumber = block.number
                                tx.address = rawTx.from
                                tx.txIndex = i
                                tx.transactionHash = rawTx.hash
                                tx.calldata = rawTx.data
                                ethTxs.push(tx)
                            }
                        }

                        await dataSource.manager.transaction(async man => {
                            this.log(`Saving block ${currentBlock}`)
                            await this.saveBlock(ethBlock, man)
                            await this.saveTxs(ethTxs, man)
                            await this.saveCurrentBlock(currentBlock + 1, man)
                            this.log(`Saved block ${currentBlock} with ${ethTxs.length} goerlis txs`)
                        })
                    } else {
                        await this.saveCurrentBlock(currentBlock + 1, dataSource.manager)
                    }
                }
                if (blockNum - (await this.getCurrentBlock() + this.chainConfig.confirmation) <= 0) {
                    await delay(this.config.interval)
                }
            } catch (e) {
                this.err(`Failed to sync`, e)
                await this.getCurrentBlock(true)
                await delay(100)
            }
        }
        this.log(`Stopped`)
    }

    stop() {
        this.shutdown = true
    }
}
