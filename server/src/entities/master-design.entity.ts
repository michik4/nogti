import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { NailMasterEntity } from './nailmaster.entity';
import { NailDesignEntity } from './nail-design.entity';

@Entity('master_designs')
export class MasterDesignEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    customPrice?: number; // Индивидуальная цена мастера за этот дизайн

    @Column({ type: 'text', nullable: true })
    notes?: string; // Заметки мастера о дизайне

    @Column({ type: 'int', nullable: true })
    estimatedDuration?: number; // Предполагаемая длительность в минутах

    @Column({ type: 'boolean', default: true })
    isActive!: boolean; // Активно ли предложение

    @CreateDateColumn()
    addedAt!: Date; // Когда мастер добавил "Я так могу"

    // Связи
    @ManyToOne(() => NailMasterEntity, (master) => master.designs, { onDelete: 'CASCADE' })
    nailMaster!: NailMasterEntity;

    @ManyToOne(() => NailDesignEntity, (design) => design.canDoMasters, { onDelete: 'CASCADE' })
    nailDesign!: NailDesignEntity;
} 