import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Faqs {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  question!: string;

  @Column()
  answer!: string;
}
