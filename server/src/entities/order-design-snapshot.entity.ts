import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { DesignType, DesignSource } from './nail-design.entity';

@Entity('order_design_snapshots')
export class OrderDesignSnapshotEntity {
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

    @Column({ type: 'varchar', length: 255, nullable: true })
    originalDesignId?: string; // ID оригинального дизайна (если был)

    @Column({ type: 'varchar', length: 255, nullable: true })
    authorName?: string; // Имя автора дизайна

    @Column({ type: 'varchar', length: 255, nullable: true })
    authorId?: string; // ID автора дизайна

    @CreateDateColumn()
    createdAt!: Date;
} 