import { BaseEntity, Column, Entity, In, Index, PrimaryGeneratedColumn } from "typeorm";
import { evmByteColumn } from "./column";

export enum Subprotocol {
    GRC20
}

export enum ContentType {
    APPLICATION_JSON
}

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
    @Index()
    subprotocol: Subprotocol

    @Column()
    contentType: ContentType

    @Column()
    content: string
}

@Entity()
export class GoerliInscription extends Inscription {
}

@Entity()
export class MainnetInscription extends Inscription {
}
