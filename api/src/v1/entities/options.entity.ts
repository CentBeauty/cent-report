import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Options {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  key: string;

  @Column({ nullable: true })
  value: string;
}
