import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientEntity } from './client.entity';
import { AdminEntity } from './admin.entity';
import { OrderEntity } from './order.entity';
import { MasterDesignEntity } from './master-design.entity';
import { NailMasterEntity } from './nailmaster.entity';

export enum DesignType {
    BASIC = 'basic',
    DESIGNER = 'designer'
}

export enum DesignSource {
    ADMIN = 'admin',
    CLIENT = 'client',
    MASTER = 'master'
}

@Entity('nail_designs')
export class NailDesignEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 500, nullable: false })
    imageUrl!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    videoUrl?: string;

    @Column({ 
        type: 'enum', 
        enum: DesignType, 
        default: DesignType.BASIC 
    })
    type!: DesignType;

    @Column({ 
        type: 'enum', 
        enum: DesignSource, 
        nullable: false 
    })
    source!: DesignSource;

    @Column({ type: 'json', nullable: true })
    tags?: string[];

    @Column({ type: 'varchar', length: 100, nullable: true })
    color?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    estimatedPrice?: number;

    @Column({ type: 'int', default: 0 })
    likesCount!: number;

    @Column({ type: 'int', default: 0 })
    ordersCount!: number;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'boolean', default: false })
    isModerated!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Связи
    @ManyToMany(() => ClientEntity, (client) => client.likedNailDesigns)
    likedByClients!: ClientEntity[];

    @OneToMany(() => MasterDesignEntity, (masterDesign) => masterDesign.nailDesign)
    canDoMasters!: MasterDesignEntity[];

    @ManyToOne(() => ClientEntity, (client) => client.uploadedDesigns, { nullable: true })
    uploadedByClient?: ClientEntity;

    @ManyToOne(() => AdminEntity, { nullable: true })
    uploadedByAdmin?: AdminEntity;

    @ManyToOne(() => NailMasterEntity, { nullable: true })
    uploadedByMaster?: NailMasterEntity;

    @OneToMany(() => OrderEntity, (order) => order.nailDesign)
    orders!: OrderEntity[];

    @OneToMany('ReviewEntity', 'nailDesign')
    reviews!: any[];
}