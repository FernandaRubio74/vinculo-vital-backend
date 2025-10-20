import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reward } from './reward.entity';
import { RewardStatus } from '../enums/reward-status.enum';

@Entity('user_rewards')
export class UserReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  rewardId: number;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt: Date;

  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.PENDING,
  })
  status: RewardStatus;

  @ManyToOne(() => Reward, (reward) => reward.userRewards, { eager: true })
  @JoinColumn({ name: 'rewardId' })
  reward: Reward;

  // Business logic methods
  isPending(): boolean {
    return this.status === RewardStatus.PENDING;
  }

  isRedeemed(): boolean {
    return this.status === RewardStatus.REDEEMED;
  }

  redeem(): void {
    this.status = RewardStatus.REDEEMED;
    this.redeemedAt = new Date();
  }
}
