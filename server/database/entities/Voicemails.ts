import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

import { Users } from './Users';

@Entity()
export class Voicemails {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  url!: string;

  @Column()
  isDeleted!: boolean;

  @Column()
  caller!: string;

  @Column()
  duration!: number;

  @ManyToOne(type => Users)
  user!: Users;

  @Column()
  @Index()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
