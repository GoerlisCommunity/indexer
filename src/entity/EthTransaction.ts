import { BaseEntity, Column, ColumnOptions, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { evmAddressColumn, evmByteColumn } from "./column";

export class EthTransaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column(evmAddressColumn)
    @Index({ unique: true })
    transactionHash: string

    @Column()
    txIndex: number

    @Column(evmAddressColumn)
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
