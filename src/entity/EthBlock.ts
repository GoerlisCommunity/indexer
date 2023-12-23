import { BaseEntity, Column, Entity, Index, PrimaryColumn } from "typeorm";

export class EthBlock extends BaseEntity {
    @PrimaryColumn({ type: "bigint"})
    blockNumber: number

    @Column()
    @Index()
    timestamp: number
}

@Entity()
export class GoerliBlock extends EthBlock {}

@Entity()
export class MainnetBlock extends EthBlock {}
