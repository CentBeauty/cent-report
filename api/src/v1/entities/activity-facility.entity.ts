
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity()
export class ActivityFacility {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    store_id: number;
    
    @Column({ nullable: true })
    type: number;

    @Column({ nullable: true })
    time_used: Date;

    @Column({ nullable: true })
    status: number;

    @Column({ nullable: true })
    booking_id: number;
    
    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;
}