import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, TableInheritance } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export enum Role {
    ADMIN = 'admin',
    NAILMASTER = 'nailmaster',
    CLIENT = 'client',
}

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    username!: string;

    @Column({ type: 'varchar', length: 255, nullable: false})
    @Exclude()
    password!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    role!: Role;

    // temporary user flag
    @Column({ type: 'boolean', default: false })
    isGuest!: boolean;

    @Column({ type: 'boolean', default: false })
    blocked!: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar_url?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', nullable: false })
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt(12);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}

