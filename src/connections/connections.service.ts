import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection, ConnectionStatus } from './entities/connection.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ConnectionsService {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
    private jwtService: JwtService
  ) {}

  private getUserIdFromToken(token: string): string {
    try {
      if (!token || !token.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token inválido');
      }
      const decoded = this.jwtService.verify(token.replace('Bearer ', ''));
      this.logger.debug(`Decoded token for user: ${decoded.sub}`);
      return decoded.sub;
    } catch (error) {
      this.logger.error(`Error decoding token: ${error.message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async findPendingConnections(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const userId = this.getUserIdFromToken(authHeader);

    const connections = await this.connectionRepository.find({
      where: [
        { elderId: userId, status: ConnectionStatus.PENDING },
        { youngId: userId, status: ConnectionStatus.PENDING }
      ],
      order: { createdAt: 'DESC' },
      relations: ['elder', 'young'],
    });

    return connections;
  }

  async findActiveConnections(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const userId = this.getUserIdFromToken(authHeader);

    const connections = await this.connectionRepository.find({
      where: [
        { elderId: userId, status: ConnectionStatus.ACTIVE },
        { youngId: userId, status: ConnectionStatus.ACTIVE }
      ],
      order: { lastActivityAt: 'DESC' },
      relations: ['elder', 'young'],
    });

    return connections;
  }

  async updateLastActivity(connectionId: string, authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const userId = this.getUserIdFromToken(authHeader);
    
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Conexión no encontrada');
    }

    // Verificar que el usuario que actualiza es parte de la conexión
    if (connection.elderId !== userId && connection.youngId !== userId) {
      throw new UnauthorizedException('No autorizado para actualizar esta conexión');
    }

    connection.lastActivityAt = new Date();
    await this.connectionRepository.save(connection);
  }
}
