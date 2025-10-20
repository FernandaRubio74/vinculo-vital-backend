import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Connections')
@ApiBearerAuth()
@Controller('connections')
export class ConnectionsController {
  private readonly logger = new Logger(ConnectionsController.name);

  constructor(private readonly connectionsService: ConnectionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('pending')
  @ApiOperation({ summary: 'Obtener conexiones pendientes del usuario' })
  async getPendingConnections(@Request() req) {
    this.logger.debug(`Obteniendo las conexiones pendientes con ayuda de el auth header ${req.headers.authorization}`);
    return await this.connectionsService.findPendingConnections(req.headers.authorization);
  }

  @UseGuards(JwtAuthGuard)
  @Get('active')
  @ApiOperation({ summary: 'Obtener conexiones activas' })
  async getActiveConnections(@Request() req) {
    this.logger.debug(`Obteniendo las conexiones activas con auth header: ${req.headers.authorization}`);
    return await this.connectionsService.findActiveConnections(req.headers.authorization);
  }
}