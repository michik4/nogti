import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { NailMasterEntity } from "./nailmaster.entity";
import { ClientEntity } from "./client.entity";

@Entity('masterRatings')
export class MasterRatingEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'int', nullable: false })
    ratingNumber!: number;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @Column({type: 'date', nullable: false})
    createdAt!: Date;

    // связи
    @ManyToOne(() => NailMasterEntity, (master) => master.ratings, { onDelete: 'CASCADE' })
    nailMaster!: NailMasterEntity;

    @ManyToOne(() => ClientEntity, (client) => client.ratings, { onDelete: 'CASCADE' })
    client!: ClientEntity;
};