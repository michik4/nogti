import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NailMasterEntity } from './nailmaster.entity';

export enum ScheduleStatus {
    AVAILABLE = 'available',
    BOOKED = 'booked',
    BLOCKED = 'blocked'
}

@Entity('schedules')
export class ScheduleEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'date', nullable: false })
    workDate!: Date;

    @Column({ type: 'time', nullable: false })
    startTime!: string;

    @Column({ type: 'time', nullable: false })
    endTime!: string;

    @Column({ 
        type: 'enum', 
        enum: ScheduleStatus, 
        default: ScheduleStatus.AVAILABLE 
    })
    status!: ScheduleStatus;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Связи
    @ManyToOne(() => NailMasterEntity, (master) => master.schedules)
    nailMaster!: NailMasterEntity;
} 