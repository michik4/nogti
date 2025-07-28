import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientEntity } from './client.entity';
import { NailMasterEntity } from './nailmaster.entity';
import { NailDesignEntity } from './nail-design.entity';
import { MasterServiceEntity } from './master-service.entity';

export enum OrderStatus {
    PENDING = 'pending', // Ожидает ответа мастера
    CONFIRMED = 'confirmed', // Подтверждена мастером
    ALTERNATIVE_PROPOSED = 'alternative_proposed', // Мастер предложил другое время
    DECLINED = 'declined', // Отклонена мастером
    TIMEOUT = 'timeout', // Мастер не ответил в течение 5 минут
    COMPLETED = 'completed', // Выполнена
    CANCELLED = 'cancelled' // Отменена
}

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ 
        type: 'enum', 
        enum: OrderStatus, 
        default: OrderStatus.PENDING 
    })
    status!: OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price?: number;

    @Column({ type: 'timestamp', nullable: false })
    requestedDateTime!: Date;

    @Column({ type: 'timestamp', nullable: true })
    proposedDateTime?: Date; // Альтернативное время от мастера

    @Column({ type: 'timestamp', nullable: true })
    confirmedDateTime?: Date; // Подтвержденное время

    @Column({ type: 'text', nullable: true })
    masterNotes?: string;

    @Column({ type: 'text', nullable: true })
    clientNotes?: string;

    @Column({ type: 'timestamp', nullable: true })
    masterResponseTime?: Date; // Время ответа мастера

    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date; // Время завершения заказа

    @Column({ type: 'varchar', length: 20, nullable: true })
    completedBy?: 'master' | 'client' | 'auto'; // Кто завершил заказ

    @Column({ type: 'int', nullable: true })
    rating?: number; // Оценка от 1 до 5

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Связи
    @ManyToOne(() => ClientEntity, (client) => client.orders)
    client!: ClientEntity;

    @ManyToOne(() => NailMasterEntity, (master) => master.orders)
    nailMaster!: NailMasterEntity;

    @ManyToOne(() => MasterServiceEntity, { nullable: false })
    masterService!: MasterServiceEntity; // Обязательная услуга

    @ManyToOne(() => NailDesignEntity, (design) => design.orders, { nullable: true })
    nailDesign?: NailDesignEntity; // Опциональный дизайн
}