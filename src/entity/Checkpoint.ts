import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Checkpoint extends BaseEntity {
    @PrimaryColumn()
    ckpt: string;

    @Column()
    blocknumber: number
}