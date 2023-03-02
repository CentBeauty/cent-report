import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, UpdateDateColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { Voucher_Code } from './vouchers.entity';
@Entity()
export class Voucher_Condition {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    value: string;

    @Column({ nullable: true })
    voucher_id: number;

    @Column({ nullable: true })
    type: number;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @ManyToOne(() => Voucher_Code, (voucher) => voucher.conditions)
    @JoinColumn({ name: 'voucher_id' })
    voucher: Voucher_Code
}
