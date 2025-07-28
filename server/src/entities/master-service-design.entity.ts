import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MasterServiceEntity } from './master-service.entity';
import { NailDesignEntity } from './nail-design.entity';

@Entity('master_service_designs')
export class MasterServiceDesignEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    customPrice?: number; // Индивидуальная цена за этот дизайн в рамках услуги

    @Column({ type: 'int', nullable: true })
    additionalDuration?: number; // Дополнительное время для сложного дизайна (в минутах)

    @Column({ type: 'text', nullable: true })
    notes?: string; // Заметки мастера о дизайне в рамках услуги

    @Column({ type: 'boolean', default: true })
    isActive!: boolean; // Доступен ли дизайн для этой услуги

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Связи
    @ManyToOne(() => MasterServiceEntity, { onDelete: 'CASCADE' })
    masterService!: MasterServiceEntity;

    @ManyToOne(() => NailDesignEntity, { onDelete: 'CASCADE' })
    nailDesign!: NailDesignEntity;
} 