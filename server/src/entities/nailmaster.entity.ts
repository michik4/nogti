import { ChildEntity, Column, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderEntity } from './order.entity';
import { MasterDesignEntity } from './master-design.entity';
import { ScheduleEntity } from './schedule.entity';
import { MasterServiceEntity } from './master-service.entity';
import { MasterRatingEntity } from './master-rating.entity';

@ChildEntity('nailmaster')
export class NailMasterEntity extends UserEntity {
    @Column({ type: 'varchar', length: 255, nullable: false })
    fullName!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    address?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
    phone!: string;

    @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
    rating!: number;

    @Column({ type: 'int', default: 0 })
    totalOrders!: number;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude?: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude?: number;

    @Column({ type: 'boolean', default: false })
    isModerated!: boolean;

    @Column({ type: 'int', default: 0 })
    reviewsCount!: number;

    @Column("simple-array", { nullable: true })
    specialties!: string[];

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    startingPrice!: number;

    // Связи
    @OneToMany(() => OrderEntity, (order) => order.nailMaster)
    orders!: OrderEntity[];

    @OneToMany(() => MasterRatingEntity, (rating) => rating.nailMaster)
    ratings!: MasterRatingEntity;

    @OneToMany(() => MasterDesignEntity, (masterDesign) => masterDesign.nailMaster)
    designs!: MasterDesignEntity[];

    @OneToMany(() => ScheduleEntity, (schedule) => schedule.nailMaster)
    schedules!: ScheduleEntity[];

    @OneToMany(() => MasterServiceEntity, service => service.master)
    services!: MasterServiceEntity[];
}
