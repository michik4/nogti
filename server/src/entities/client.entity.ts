import { ChildEntity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from './user.entity';
import { NailDesignEntity } from './nail-design.entity';
import { OrderEntity } from './order.entity';
import { MasterRatingEntity } from './master-rating.entity';

@ChildEntity('client')
export class ClientEntity extends UserEntity {
    @Column({ type: 'varchar', length: 255, nullable: true })
    fullName?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude?: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude?: number;

    // Связи
    @ManyToMany(() => NailDesignEntity, (nailDesign) => nailDesign.likedByClients, {
        eager: false,
        cascade: true
    })
    @JoinTable({
        name: 'client_liked_designs',
        joinColumn: {
            name: 'clientId',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'nailDesignId',
            referencedColumnName: 'id'
        }
    })
    likedNailDesigns!: NailDesignEntity[];

    @OneToMany(() => OrderEntity, (order) => order.client)
    orders!: OrderEntity[];

    @OneToMany('ReviewEntity', 'client')
    reviews!: any[];

    @OneToMany(() => MasterRatingEntity, (rating) => rating.client)
    ratings!: MasterRatingEntity;

    @OneToMany(() => NailDesignEntity, (design) => design.uploadedByClient)
    uploadedDesigns!: NailDesignEntity[];
}