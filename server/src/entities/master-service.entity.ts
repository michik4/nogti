import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { NailMasterEntity } from "./nailmaster.entity";
import { MasterServiceDesignEntity } from "./master-service-design.entity";

@Entity('master_services')
export class MasterServiceEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int" })
  duration!: number; // в минутах

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => NailMasterEntity, (master: NailMasterEntity) => master.services, {
    onDelete: 'CASCADE'
  })
  master!: NailMasterEntity;

  @OneToMany(() => MasterServiceDesignEntity, (serviceDesign) => serviceDesign.masterService)
  designs!: MasterServiceDesignEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 