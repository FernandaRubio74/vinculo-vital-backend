import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { ActionType } from './enums/action-type.enum';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,
  ) {}

  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    const history = this.historyRepository.create(createHistoryDto);
    return await this.historyRepository.save(history);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ history: History[]; total: number; page: number; totalPages: number }> {
    if (limit > 100) {
      throw new BadRequestException('El límite máximo es 100');
    }

    const skip = (page - 1) * limit;

    const [history, total] = await this.historyRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      history,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUserIdAndActionType(
    userId: string,
    actionType: ActionType,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ history: History[]; total: number; page: number; totalPages: number }> {
    if (limit > 100) {
      throw new BadRequestException('El límite máximo es 100');
    }

    const skip = (page - 1) * limit;

    const [history, total] = await this.historyRepository.findAndCount({
      where: { userId, actionType },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      history,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserStats(userId: string): Promise<{
    totalActions: number;
    actionsByType: Record<ActionType, number>;
    recentActions: number;
    lastActionDate: Date | null;
  }> {
    const allHistory = await this.historyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const totalActions = allHistory.length;

    // Contar acciones por tipo
    const actionsByType: Record<ActionType, number> = {
      [ActionType.CALL]: 0,
      [ActionType.REWARD]: 0,
      [ActionType.LOGIN]: 0,
      [ActionType.LOGOUT]: 0,
      [ActionType.MATCH]: 0,
      [ActionType.CONNECTION]: 0,
      [ActionType.PROFILE_UPDATE]: 0,
    };

    allHistory.forEach((entry) => {
      actionsByType[entry.actionType]++;
    });

    // Contar acciones recientes (últimas 24 horas)
    const recentActions = allHistory.filter((entry) =>
      entry.isRecentAction(24),
    ).length;

    // Obtener fecha de la última acción
    const lastActionDate = allHistory.length > 0 ? allHistory[0].createdAt : null;

    return {
      totalActions,
      actionsByType,
      recentActions,
      lastActionDate,
    };
  }

  async getActionTypeCount(userId: string, actionType: ActionType): Promise<number> {
    return await this.historyRepository.count({
      where: { userId, actionType },
    });
  }

  async getRecentHistory(
    userId: string,
    hoursAgo: number = 24,
  ): Promise<History[]> {
    const allHistory = await this.historyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return allHistory.filter((entry) => entry.isRecentAction(hoursAgo));
  }

  async deleteUserHistory(userId: string): Promise<void> {
    await this.historyRepository.delete({ userId });
  }
}
