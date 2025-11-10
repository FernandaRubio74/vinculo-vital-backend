import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus } from './entities/message.entity';
import { Connection } from '../connections/entities/connection.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}

  // Enviar mensaje
  async sendMessage(
    senderId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    const { receiverId, connectionId, content } = sendMessageDto;

    // Verificar que la conexión existe y está activa
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Conexión no encontrada');
    }

    // Verificar que el usuario es parte de la conexión
    if (
      connection.elderId !== senderId &&
      connection.youngId !== senderId
    ) {
      throw new ForbiddenException('No tienes acceso a esta conexión');
    }

    // Verificar que el receptor es correcto
    if (
      connection.elderId !== receiverId &&
      connection.youngId !== receiverId
    ) {
      throw new ForbiddenException('Receptor inválido para esta conexión');
    }

    // Crear mensaje
    const message = this.messageRepository.create({
      senderId,
      receiverId,
      connectionId,
      content,
      status: MessageStatus.SENT,
    });

    return await this.messageRepository.save(message);
  }

  // Obtener mensajes de una conversación
  async getMessages(
    userId: string,
    connectionId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
    // Verificar acceso a la conexión
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Conexión no encontrada');
    }

    if (connection.elderId !== userId && connection.youngId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta conexión');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { connectionId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      messages: messages.reverse(), // Invertir para mostrar cronológicamente
      total,
      hasMore: skip + messages.length < total,
    };
  }

  // Obtener mensajes nuevos (para polling)
  async getNewMessages(
    userId: string,
    connectionId: string,
    lastMessageId?: string,
  ): Promise<Message[]> {
    // Verificar acceso
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Conexión no encontrada');
    }

    if (connection.elderId !== userId && connection.youngId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta conexión');
    }

    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.connectionId = :connectionId', { connectionId })
      .andWhere('message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'ASC');

    if (lastMessageId) {
      const lastMessage = await this.messageRepository.findOne({
        where: { id: lastMessageId },
      });

      if (lastMessage) {
        query.andWhere('message.createdAt > :lastCreatedAt', {
          lastCreatedAt: lastMessage.createdAt,
        });
      }
    }

    return await query.getMany();
  }

  // Marcar mensajes como leídos
  async markAsRead(
    userId: string,
    connectionId: string,
  ): Promise<{ updated: number }> {
    const result = await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        status: MessageStatus.READ,
        readAt: new Date(),
      })
      .where('connectionId = :connectionId', { connectionId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('status != :readStatus', { readStatus: MessageStatus.READ })
      .execute();

    return { updated: result.affected || 0 };
  }

  // Contar mensajes no leídos
  async countUnreadMessages(
    userId: string,
    connectionId?: string,
  ): Promise<number> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.receiverId = :userId', { userId })
      .andWhere('message.status != :readStatus', {
        readStatus: MessageStatus.READ,
      });

    if (connectionId) {
      query.andWhere('message.connectionId = :connectionId', { connectionId });
    }

    return await query.getCount();
  }
}