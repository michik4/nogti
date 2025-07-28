import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';

export enum NotificationType {
    ORDER_CREATED = 'order_created', // Новая заявка для мастера
    ORDER_CONFIRMED = 'order_confirmed', // Заявка подтверждена
    ORDER_DECLINED = 'order_declined', // Заявка отклонена
    ORDER_TIMEOUT = 'order_timeout', // Мастер не ответил вовремя
    ALTERNATIVE_TIME_PROPOSED = 'alternative_time_proposed', // Предложено другое время
    RATING_DECREASED = 'rating_decreased', // Понижен рейтинг
    NEW_DESIGN_UPLOADED = 'new_design_uploaded' // Загружен новый дизайн
}

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ 
        type: 'enum', 
        enum: NotificationType, 
        nullable: false 
    })
    type!: NotificationType;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string;

    @Column({ type: 'text', nullable: false })
    message!: string;

    @Column({ type: 'boolean', default: false })
    isRead!: boolean;

    @Column({ type: 'boolean', default: false })
    isSent!: boolean; // Отправлено ли SMS/email

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>; // Дополнительные данные

    @CreateDateColumn()
    createdAt!: Date;

    // Связи
    @ManyToOne(() => UserEntity)
    recipient!: UserEntity;

    @ManyToOne(() => OrderEntity, { nullable: true })
    relatedOrder?: OrderEntity;
} 