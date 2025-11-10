import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar mensaje' })
  @ApiCreatedResponse({ description: 'Mensaje enviado', type: Message })
  async sendMessage(
    @Request() req,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    return await this.chatService.sendMessage(req.user.userId, sendMessageDto);
  }

  @Get('messages/:connectionId')
  @ApiOperation({ summary: 'Obtener mensajes de una conversación' })
  @ApiOkResponse({ description: 'Lista de mensajes' })
  async getMessages(
    @Request() req,
    @Param('connectionId', new ParseUUIDPipe()) connectionId: string,
    @Query() query: GetMessagesDto,
  ) {
    return await this.chatService.getMessages(
      req.user.userId,
      connectionId,
      query.page,
      query.limit,
    );
  }

  @Get('new/:connectionId')
  @ApiOperation({ summary: 'Obtener mensajes nuevos (polling)' })
  @ApiOkResponse({ description: 'Mensajes nuevos' })
  async getNewMessages(
    @Request() req,
    @Param('connectionId', new ParseUUIDPipe()) connectionId: string,
    @Query('lastMessageId') lastMessageId?: string,
  ): Promise<Message[]> {
    return await this.chatService.getNewMessages(
      req.user.userId,
      connectionId,
      lastMessageId,
    );
  }

  @Patch('read/:connectionId')
  @ApiOperation({ summary: 'Marcar mensajes como leídos' })
  @ApiOkResponse({ description: 'Mensajes marcados como leídos' })
  async markAsRead(
    @Request() req,
    @Param('connectionId', new ParseUUIDPipe()) connectionId: string,
  ) {
    return await this.chatService.markAsRead(req.user.userId, connectionId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Contar mensajes no leídos' })
  @ApiOkResponse({ description: 'Cantidad de mensajes no leídos' })
  async countUnread(
    @Request() req,
    @Query('connectionId') connectionId?: string,
  ): Promise<{ count: number }> {
    const count = await this.chatService.countUnreadMessages(
      req.user.userId,
      connectionId,
    );
    return { count };
  }
}