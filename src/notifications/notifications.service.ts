import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationCallDto } from './dto/notification-call.dto';
import { NotificationRewardDto } from './dto/notification-reward.dto';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async createCallNotification(
    notificationCallDto: NotificationCallDto,
  ): Promise<Notification> {
    const { userId, message, caller } = notificationCallDto;

    const notification = this.notificationsRepository.create({
      userId,
      type: NotificationType.CALL,
      message,
      metadata: { caller },
      isRead: false,
    });

    return await this.notificationsRepository.save(notification);
  }

  async createRewardNotification(
    notificationRewardDto: NotificationRewardDto,
  ): Promise<Notification> {
    const { userId, message, rewardId } = notificationRewardDto;

    const notification = this.notificationsRepository.create({
      userId,
      type: NotificationType.REWARD,
      message,
      metadata: { rewardId },
      isRead: false,
    });

    return await this.notificationsRepository.save(notification);
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return await this.notificationsRepository.save(notification);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    if (limit > 100) {
      throw new BadRequestException('El límite máximo es 100');
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    notification.markAsRead();
    return await this.notificationsRepository.save(notification);
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }
}
