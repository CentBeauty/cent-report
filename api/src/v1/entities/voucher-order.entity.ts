import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class VoucherOrder {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  order: string;

  @Column({ nullable: true })
  voucher: string;
}
