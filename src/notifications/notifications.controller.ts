import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationCallDto } from './dto/notification-call.dto';
import { NotificationRewardDto } from './dto/notification-reward.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('call')
  @ApiOperation({ summary: 'Notificar llamada entrante' })
  @ApiBody({ type: NotificationCallDto })
  @ApiOkResponse({
    description: 'Notificación de llamada creada',
    type: Notification,
  })
  async createCallNotification(
    @Body() notificationCallDto: NotificationCallDto,
  ): Promise<Notification> {
    return await this.notificationsService.createCallNotification(
      notificationCallDto,
    );
  }

  @Post('reward')
  @ApiOperation({ summary: 'Notificar recompensa obtenida' })
  @ApiBody({ type: NotificationRewardDto })
  @ApiOkResponse({
    description: 'Notificación de recompensa creada',
    type: Notification,
  })
  async createRewardNotification(
    @Body() notificationRewardDto: NotificationRewardDto,
  ): Promise<Notification> {
    return await this.notificationsService.createRewardNotification(
      notificationRewardDto,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear notificación genérica' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiOkResponse({
    description: 'Notificación creada',
    type: Notification,
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return await this.notificationsService.create(createNotificationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener notificaciones de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de resultados por página (default: 20, max: 100)',
  })
  @ApiOkResponse({
    description: 'Lista de notificaciones del usuario',
    type: Notification,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  async findByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    return await this.notificationsService.findByUserId(userId, page, limit);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Cantidad de notificaciones no leídas',
  })
  async countUnread(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationsService.countUnreadByUserId(userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la notificación',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Notificación marcada como leída',
    type: Notification,
  })
  @ApiNotFoundResponse({ description: 'Notificación no encontrada' })
  async markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Notification> {
    return await this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Todas las notificaciones marcadas como leídas',
  })
  async markAllAsRead(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{ message: string }> {
    await this.notificationsService.markAllAsReadByUserId(userId);
    return { message: 'Todas las notificaciones han sido marcadas como leídas' };
  }
}
