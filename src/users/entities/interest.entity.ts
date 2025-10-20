import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum InterestCategory {
  HOBBIES = 'HOBBIES',
  COOKING = 'COOKING',
  CRAFTS = 'CRAFTS',
  STORIES = 'STORIES',
  MUSIC = 'MUSIC',
  SPORTS = 'SPORTS',
  TECHNOLOGY = 'TECHNOLOGY',
  CULTURE = 'CULTURE',
  OTHER = 'OTHER'
}

@Entity('interests')
export class Interest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: InterestCategory,
  })
  category: InterestCategory;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => User, (user) => user.interests)
  users: User[];
}