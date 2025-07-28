import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientEntity } from './client.entity';
import { NailDesignEntity } from './nail-design.entity';
import { NailMasterEntity } from './nailmaster.entity';

@Entity('reviews')
export class ReviewEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text', nullable: false })
    comment!: string;

    @Column({ type: 'int', nullable: true })
    rating?: number; // Рейтинг от 1 до 5

    @Column({ type: 'varchar', length: 500, nullable: true })
    imageUrl?: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Связи
    @ManyToOne(() => ClientEntity, (client) => client.reviews)
    client!: ClientEntity;

    @ManyToOne(() => NailDesignEntity, (design) => design.reviews)
    nailDesign!: NailDesignEntity;

    @ManyToOne(() => NailMasterEntity, { nullable: true })
    nailMaster?: NailMasterEntity;
} 