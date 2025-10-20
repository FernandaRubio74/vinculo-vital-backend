import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseBoolPipe,
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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { UserReward } from './entities/user-reward.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { AssignRewardDto } from './dto/assign-reward.dto';
import { RewardStatus } from './enums/reward-status.enum';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las recompensas disponibles' })
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
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Mostrar solo recompensas activas (default: true)',
  })
  @ApiOkResponse({
    description: 'Lista de recompensas',
    type: Reward,
    isArray: true,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('activeOnly', new DefaultValuePipe(true), ParseBoolPipe)
    activeOnly: boolean,
  ): Promise<{ rewards: Reward[]; total: number; page: number; totalPages: number }> {
    return await this.rewardsService.findAll(page, limit, activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una recompensa' })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    type: 'number',
  })
  @ApiOkResponse({
    description: 'Detalle de la recompensa',
    type: Reward,
  })
  @ApiNotFoundResponse({ description: 'Recompensa no encontrada' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Reward> {
    return await this.rewardsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva recompensa (admin)' })
  @ApiBody({ type: CreateRewardDto })
  @ApiCreatedResponse({
    description: 'Recompensa creada exitosamente',
    type: Reward,
  })
  async create(
    @Body() createRewardDto: CreateRewardDto,
  ): Promise<Reward> {
    return await this.rewardsService.create(createRewardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar recompensa (admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    type: 'number',
  })
  @ApiBody({ type: CreateRewardDto })
  @ApiOkResponse({
    description: 'Recompensa actualizada',
    type: Reward,
  })
  @ApiNotFoundResponse({ description: 'Recompensa no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRewardDto: Partial<CreateRewardDto>,
  ): Promise<Reward> {
    return await this.rewardsService.update(id, updateRewardDto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar recompensa (admin)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la recompensa',
    type: 'number',
  })
  @ApiOkResponse({
    description: 'Recompensa desactivada',
    type: Reward,
  })
  @ApiNotFoundResponse({ description: 'Recompensa no encontrada' })
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Reward> {
    return await this.rewardsService.deactivate(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Recompensas de un usuario específico' })
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
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RewardStatus,
    description: 'Filtrar por estado (PENDING/REDEEMED)',
  })
  @ApiOkResponse({
    description: 'Lista de recompensas del usuario',
    type: UserReward,
    isArray: true,
  })
  async findUserRewards(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: RewardStatus,
  ): Promise<{ userRewards: UserReward[]; total: number; page: number; totalPages: number }> {
    return await this.rewardsService.findUserRewards(userId, page, limit, status);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Estadísticas de recompensas del usuario' })
  @ApiParam({
    name: 'userId',
    description: 'UUID del usuario',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Estadísticas de recompensas',
  })
  async getUserStats(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<{
    totalRewards: number;
    pendingRewards: number;
    redeemedRewards: number;
  }> {
    return await this.rewardsService.getUserRewardsStats(userId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Asignar recompensa a usuario' })
  @ApiBody({ type: AssignRewardDto })
  @ApiCreatedResponse({
    description: 'Recompensa asignada exitosamente',
    type: UserReward,
  })
  @ApiBadRequestResponse({
    description: 'Puntos insuficientes o recompensa no disponible',
  })
  @ApiNotFoundResponse({ description: 'Recompensa no encontrada' })
  async assignReward(
    @Body() assignRewardDto: AssignRewardDto,
  ): Promise<UserReward> {
    return await this.rewardsService.assignReward(assignRewardDto);
  }

  @Patch('user-reward/:id/redeem')
  @ApiOperation({ summary: 'Canjear recompensa asignada' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la recompensa de usuario',
    type: 'string',
  })
  @ApiOkResponse({
    description: 'Recompensa canjeada exitosamente',
    type: UserReward,
  })
  @ApiNotFoundResponse({ description: 'Recompensa de usuario no encontrada' })
  @ApiBadRequestResponse({ description: 'La recompensa ya ha sido canjeada' })
  async redeemReward(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserReward> {
    return await this.rewardsService.redeemReward(id);
  }
}
