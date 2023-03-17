import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import {
  UniqueCodeEnum,
  ActivesEnum,
  IfEnum,
  ThenEnum,
  ApplyEnum,
  typeOnLyVoucher,
  Status,
} from '../enums/columns.enum';
import { Voucher_Condition } from './conditions.entity';
@Entity()
export class Voucher_Code {
  @PrimaryGeneratedColumn()
  id: number;
  @Index('code-idx')
  @Column({ nullable: true })
  code: string;
  @Index('rule_name-idx')
  @Column({ nullable: true })
  rule_name: string;

  @Column({ nullable: true })
  des: string;

  @Column({ nullable: true })
  stores: string;

  @Column({ default: UniqueCodeEnum.isNotUnique })
  unique_code: number;

  @Column({ default: ActivesEnum.isActive })
  active: number;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @Column({ default: IfEnum.ALL })
  if_condition: number;

  @Column({ default: ThenEnum.TRUE })
  then_condition: number;

  @Column({ default: ApplyEnum.PERCENT })
  apply: number;

  @Column({ default: typeOnLyVoucher.FALSE })
  is_only_one: number;

  @Column({ default: 0 })
  amount: number;

  @Column({ nullable: true })
  packages: string;

  @Column({ nullable: true })
  type: number;

  @Column({ default: 0 })
  month: number;

  @Column({ default: 0 })
  expired: number;

  @Column({ default: 0 })
  max_amount: number;

  @Column({ nullable: true })
  created_by: number;

  @Column({ default: Status.APPLYING })
  status: number;

  @Column({ default: 0 })
  is_for_voucher: number;

  @Column({ nullable: true })
  updated_by: number;

  @OneToMany(() => Voucher_Condition, (condition) => condition.voucher)
  conditions: Voucher_Condition[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}
