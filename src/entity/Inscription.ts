import { BaseEntity, Column, ColumnOptions, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { evmByteColumn } from "./column";

@Entity()
@Index(["transactionHash", "txIndex"], { unique: true })
export abstract class Inscription extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column(evmByteColumn)
    @Index()
    transactionHash: string

    @Column()
    txIndex: number

    @Column(evmByteColumn)
    address: string

    @Column({ type: "bigint" })
    @Index()
    blockNumber: number

    @Column()
    contentType: string

    @Column({ type: "jsonb" })
    content: {}
}

@Entity()
export class GoerliInscription extends Inscription {}

@Entity()
export class MainnetInscription extends Inscription {}
