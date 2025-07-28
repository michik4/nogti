import { ChildEntity, Column } from 'typeorm';
import { UserEntity } from './user.entity';

@ChildEntity('admin')
export class AdminEntity extends UserEntity {
    @Column({ type: 'varchar', length: 255, nullable: false })
    fullName!: string;

    @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
    phone!: string;

    @Column({ type: 'json', nullable: true })
    permissions?: string[];

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;
}
