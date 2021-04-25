import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeUpdate,
  BeforeInsert
} from 'typeorm';

import {
  validateOrReject,
  IsNotEmpty,
  Min,
  Max,
  IsOptional
} from 'class-validator';

export type PlatformType = 'android' | 'ios';

export interface Contacts {
  [index: string]: {
    givenName: string;
    familyName: string;
  };
}

export interface Safelist {
  [index: string]: boolean;
}

export interface UserSettings {
  robocallPN: string;
  voicemailGreeting: string;
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsNotEmpty()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  @Index({ unique: true })
  @IsNotEmpty()
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  @Index({ unique: true })
  phoneNum!: string;

  @Column({ nullable: true })
  phoneNumVerifyCode!: number;

  @Column({ nullable: true })
  phoneNumVerifyCodeExpires!: Date;

  @Column({ nullable: true })
  resetPasswordToken!: number;

  @Column({ nullable: true })
  resetPasswordExpires!: Date;

  @Column({ type: 'jsonb', default: {} })
  safelist!: Safelist;

  @Column({ type: 'jsonb', default: {} })
  contacts!: Contacts;

  @Column({
    type: 'jsonb',
    default: {}
  })
  settings!: UserSettings;

  @Column()
  @Min(0)
  @Max(9)
  onboardingStep!: number;

  @Column({ type: 'enum', enum: ['android', 'ios'], nullable: true })
  platform!: PlatformType;

  @Column({ nullable: true })
  appleDeviceToken!: string;

  @Column({ nullable: true })
  androidDeviceToken!: string;

  @Column({ nullable: true })
  carrier!: string;

  @Column({ type: 'jsonb', default: {} })
  deviceInfo!: any;

  @Column({ nullable: true })
  appVersion!: string;

  @Column({ nullable: true })
  codePushVersion!: string;

  @Column({ nullable: true })
  notSubscribedGracePeriod!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}
