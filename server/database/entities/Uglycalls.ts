import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn
} from 'typeorm';

@Entity()
export class Uglycalls {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Twilio Info
  @Column({ nullable: true })
  apiVersion!: string;

  @Column({ nullable: true })
  callStatus!: string;

  @Column({ nullable: true })
  accountSid!: string;

  @Column({ nullable: true })
  callSid!: string;

  @Column()
  called!: string;

  @Column({ nullable: true })
  calledCity!: string;

  @Column({ nullable: true })
  calledCountry!: string;

  @Column({ nullable: true })
  calledVia!: string;

  @Column({ nullable: true })
  calledZip!: string;

  @Column({ nullable: true })
  caller!: string;

  @Column({ nullable: true })
  callerCity!: string;

  @Column({ nullable: true })
  callerCountry!: string;

  @Column({ nullable: true })
  callerState!: string;

  @Column({ nullable: true })
  calledState!: string;

  @Column({ nullable: true })
  callerZip!: string;

  @Column({ nullable: true })
  direction!: string;

  @Column({ nullable: true })
  callDuration!: number;

  @Column({ nullable: true })
  from!: string;

  @Column({ nullable: true })
  forwardedFrom!: string;

  @Column({ nullable: true })
  fromCity!: string;

  @Column({ nullable: true })
  fromCountry!: string;

  @Column({ nullable: true })
  fromState!: string;

  @Column({ nullable: true })
  fromZip!: string;

  @Column({ nullable: true })
  to!: string;

  @Column({ nullable: true })
  toCity!: string;

  @Column({ nullable: true })
  toCountry!: string;

  @Column({ nullable: true })
  toState!: string;

  @Column({ nullable: true })
  toZip!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
