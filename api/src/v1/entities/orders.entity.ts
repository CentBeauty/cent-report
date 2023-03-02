import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn, OneToOne } from 'typeorm';
import { Store } from './stores.entity'
import { Customer } from './customers.entity';
import { OrderItem } from './order-item.entity'
import { Transaction } from './transaction.entity';
import { User } from './users.entity';
import { Note } from "./notes.entity"

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    order_code: string;

    @Column({ nullable: true })
    status: number; // 1: đang xử lý, 2: hủy order, 3: đã thanh toán

    @Column("text", { nullable: true })
    description: string;

    @Column({ nullable: true })
    sale_rule_applied_ids: string;

    @Column({ nullable: true, default: 0 })
    money_owed: number;

    @Column({ nullable: true })
    total_price: number;

    @Column({ nullable: true })
    total_price_before: number;

    @Column({ nullable: true })
    deposit_total: number;

    @Column({ nullable: true })
    payment_type: string;

    @Column({ nullable: true })
    discount_by_total_bill: number;

    @Column({ nullable: true })
    discount_by_rule: number;

    @Column({ nullable: true })
    source_from: string;

    @Column({ nullable: true })
    staff_booking: string

    @Column({ nullable: true })
    customer_name: string

    @Column({ nullable: true })
    customer_mobile: string

    @Column({ type: "timestamp", nullable: true })
    order_at: Date;

    @Column({ type: "timestamp", nullable: true })
    soft_delete: Date;

    @Column({ nullable: true })
    created_by: number;

    @Column({ nullable: true })
    updated_by: number;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @Column({ nullable: true })
    created_name: string

    @ManyToOne(() => Store, (store) => store.order)
    @JoinColumn({ name: 'store_id' })
    stores: Store;

    @ManyToOne(() => Customer, (customer) => customer.order)
    @JoinColumn({ name: 'customer_id' })
    customers: Customer;

    @Column({ nullable: true})
    isDeposit: boolean

    // @ManyToOne(() => Store, (store) => store.id)
    // @JoinColumn({ name: 'store_id' })
    // store: Store;

    @ManyToOne(() => Customer, (customer) => customer.id)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order,  {cascade: true})
    orderItem: OrderItem[];

    @ManyToOne(() => User, (User) => User.id)
    @JoinColumn({ name: 'created_by' })
    User: User;

    @OneToMany(() => Transaction, (transaction) => transaction.order)
    transaction: Transaction[];

    @Column({ nullable: true })
    id_booking: number;

    @ManyToOne(() => User, (User) => User.id)
    @JoinColumn({ name: 'updated_by' })
    updatedBy: User;

    @OneToOne(() => Note, (note) => note.order)
    note: Note;

    @Column({ nullable: true })
    parent_order_id: number;
}