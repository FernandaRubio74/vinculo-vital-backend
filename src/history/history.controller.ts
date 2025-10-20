import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
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
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { History } from './entities/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { ActionType } from './enums/action-type.enum';

@ApiTags('History')
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nueva acción en el historial' })
  @ApiBody({ type: CreateHistoryDto })
  @ApiCreatedResponse({
    description: 'Acción registrada exitosamente',
    type: History,
  })
  async create(
    @Body() createHistoryDto: CreateHistoryDto,
  ): Promise<History> {
    return await this.historyService.create(createHistoryDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Historial completo de un usuario' })
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
    description: 'Historial del usuario',
    type: History,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  async findByUserId(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ history: History[]; total: number; page: number; totalPages: number }> {
    return await this.historyService.findByUserId(userId, page, limit);
  }

  @Get('user/:userId/actions')
  @ApiOperation({ summary: 'Filtrar historial por tipo de acción' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ActionType,
    description: 'Tipo de acción a filtrar',
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
    description: 'Historial filtrado por tipo de acción',
    type: History,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Parámetros inválidos' })
  async findByActionType(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('type') type: ActionType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ history: History[]; total: number; page: number; totalPages: number }> {
    return await this.historyService.findByUserIdAndActionType(
      userId,
      type,
      page,
      limit,
    );
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Estadísticas del usuario' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Estadísticas completas del usuario',
  })
  async getUserStats(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<ActionType, number>;
    recentActions: number;
    lastActionDate: Date | null;
  }> {
    return await this.historyService.getUserStats(userId);
  }

  @Get('user/:userId/recent')
  @ApiOperation({ summary: 'Obtener acciones recientes del usuario' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiQuery({
    name: 'hours',
    required: false,
    type: Number,
    description: 'Horas hacia atrás (default: 24)',
  })
  @ApiOkResponse({
    description: 'Acciones recientes del usuario',
    type: History,
    isArray: true,
  })
  async getRecentHistory(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<History[]> {
    return await this.historyService.getRecentHistory(userId, hours);
  }

  @Get('user/:userId/action-count')
  @ApiOperation({ summary: 'Contar acciones de un tipo específico' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ActionType,
    description: 'Tipo de acción a contar',
  })
  @ApiOkResponse({
    description: 'Cantidad de acciones del tipo especificado',
  })
  async getActionTypeCount(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('type') type: ActionType,
  ): Promise<{ count: number }> {
    const count = await this.historyService.getActionTypeCount(userId, type);
    return { count };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Eliminar todo el historial de un usuario' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiNoContentResponse({
    description: 'Historial eliminado exitosamente',
  })
  async deleteUserHistory(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{ message: string }> {
    await this.historyService.deleteUserHistory(userId);
    return { message: 'Historial eliminado exitosamente' };
  }
}
