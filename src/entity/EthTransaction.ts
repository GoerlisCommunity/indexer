import { BaseEntity, Column, ColumnOptions, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { evmByteColumn } from "./column";

export class EthTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column(evmByteColumn)
    @Index({ unique: true })
    transactionHash: string

    @Column()
    txIndex: number

    @Column(evmByteColumn)
    address: string

    @Column(evmByteColumn)
    calldata: string

    @Column({ type: "bigint" })
    @Index()
    blockNumber: number
}

@Entity()
export class GoerliTransaction extends EthTransaction {
}

@Entity()
export class MainnetTransaction extends EthTransaction {
}
