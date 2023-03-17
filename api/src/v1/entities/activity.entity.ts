import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_user: number;

  @Column({ nullable: true })
  action: string;

  // @Column({ nullable: true })
  // detail: String;

  @Column('json')
  detail: {};

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
