import { TxSyncer } from "./TxSyncer";
import { GoerliBlock, MainnetBlock } from "../entity/EthBlock";
import { GoerliTransaction, MainnetTransaction } from "../entity/EthTransaction";
import { EntityManager } from "typeorm";

export class GoerliTxSyncer extends TxSyncer<GoerliBlock, GoerliTransaction> {
    createBlock(): GoerliBlock {
        return new GoerliBlock()
    }

    createTx(): GoerliTransaction {
        return new GoerliTransaction()
    }

    async saveBlock(b: GoerliBlock, man: EntityManager): Promise<void> {
        await man.createQueryBuilder()
            .insert()
            .into(GoerliBlock)
            .values(b)
            .orIgnore()
            .execute()
    }

    async saveTxs(t: GoerliTransaction[], man: EntityManager): Promise<void> {
        await man.createQueryBuilder()
            .insert()
            .into(GoerliTransaction)
            .values(t)
            .orIgnore()
            .execute()
    }
}

export class MainnetTxSyncer extends TxSyncer<MainnetBlock, MainnetTransaction> {
    createBlock(): MainnetBlock {
        return new MainnetBlock()
    }

    createTx(): MainnetTransaction {
        return new MainnetTransaction()
    }

    async saveBlock(b: MainnetBlock, man: EntityManager): Promise<void> {
        await man.createQueryBuilder()
            .insert()
            .into(MainnetBlock)
            .values(b)
            .orIgnore()
            .execute()
    }

    async saveTxs(t: MainnetTransaction[], man: EntityManager): Promise<void> {
        await man.createQueryBuilder()
            .insert()
            .into(MainnetTransaction)
            .values(t)
            .orIgnore()
            .execute()
    }
}
