import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Users } from './Users';

@Entity()
export class Subscriptions {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  platform!: string;

  @Column()
  environment!: string;

  @Column({ unique: true })
  origTxId!: string;

  @Column()
  validationResponse!: string;

  @Column()
  latestReceipt!: string;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column()
  productId!: string;

  @Column()
  isCancelled!: boolean;

  @OneToOne(type => Users, { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: Users;

  @Column()
  @Index({ unique: true })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
