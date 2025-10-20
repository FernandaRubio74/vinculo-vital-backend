import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { UserReward } from './entities/user-reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { AssignRewardDto } from './dto/assign-reward.dto';
import { RewardStatus } from './enums/reward-status.enum';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepository: Repository<Reward>,
    @InjectRepository(UserReward)
    private userRewardsRepository: Repository<UserReward>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    activeOnly: boolean = true,
  ): Promise<{ rewards: Reward[]; total: number; page: number; totalPages: number }> {
    if (limit > 100) {
      throw new BadRequestException('El límite máximo es 100');
    }

    const skip = (page - 1) * limit;
    const where: any = {};

    if (activeOnly) {
      where.isActive = true;
    }

    const [rewards, total] = await this.rewardsRepository.findAndCount({
      where,
      order: { pointsRequired: 'ASC' },
      skip,
      take: limit,
    });

    return {
      rewards,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardsRepository.findOne({
      where: { id },
    });

    if (!reward) {
      throw new NotFoundException('Recompensa no encontrada');
    }

    return reward;
  }

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardsRepository.create(createRewardDto);
    return await this.rewardsRepository.save(reward);
  }

  async update(id: number, updateRewardDto: Partial<CreateRewardDto>): Promise<Reward> {
    const reward = await this.findOne(id);
    Object.assign(reward, updateRewardDto);
    return await this.rewardsRepository.save(reward);
  }

  async deactivate(id: number): Promise<Reward> {
    const reward = await this.findOne(id);
    reward.isActive = false;
    return await this.rewardsRepository.save(reward);
  }

  async findUserRewards(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: RewardStatus,
  ): Promise<{ userRewards: UserReward[]; total: number; page: number; totalPages: number }> {
    if (limit > 100) {
      throw new BadRequestException('El límite máximo es 100');
    }

    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [userRewards, total] = await this.userRewardsRepository.findAndCount({
      where,
      order: { assignedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      userRewards,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async assignReward(assignRewardDto: AssignRewardDto): Promise<UserReward> {
    const { userId, rewardId, points } = assignRewardDto;

    // Verificar que la recompensa existe
    const reward = await this.findOne(rewardId);

    // Verificar que la recompensa está activa
    if (!reward.isAvailable()) {
      throw new BadRequestException('Esta recompensa no está disponible');
    }

    // Verificar que el usuario tiene suficientes puntos
    if (!reward.canBeClaimedWithPoints(points)) {
      throw new BadRequestException(
        `No tienes suficientes puntos. Necesitas ${reward.pointsRequired} puntos`,
      );
    }

    // Crear la asignación de recompensa
    const userReward = this.userRewardsRepository.create({
      userId,
      rewardId,
      status: RewardStatus.PENDING,
    });

    return await this.userRewardsRepository.save(userReward);
  }

  async redeemReward(id: string): Promise<UserReward> {
    const userReward = await this.userRewardsRepository.findOne({
      where: { id },
    });

    if (!userReward) {
      throw new NotFoundException('Recompensa de usuario no encontrada');
    }

    if (userReward.isRedeemed()) {
      throw new BadRequestException('Esta recompensa ya ha sido canjeada');
    }

    userReward.redeem();
    return await this.userRewardsRepository.save(userReward);
  }

  async getUserRewardsStats(userId: string): Promise<{
    totalRewards: number;
    pendingRewards: number;
    redeemedRewards: number;
  }> {
    const totalRewards = await this.userRewardsRepository.count({
      where: { userId },
    });

    const pendingRewards = await this.userRewardsRepository.count({
      where: { userId, status: RewardStatus.PENDING },
    });

    const redeemedRewards = await this.userRewardsRepository.count({
      where: { userId, status: RewardStatus.REDEEMED },
    });

    return {
      totalRewards,
      pendingRewards,
      redeemedRewards,
    };
  }
}
