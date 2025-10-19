import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum InterestCategory {
  HOBBIES = 'hobbies',
  COOKING = 'cooking',
  CRAFTS = 'crafts',
  STORIES = 'stories',
  MUSIC = 'music',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
  CULTURE = 'culture',
  OTHER = 'other',
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