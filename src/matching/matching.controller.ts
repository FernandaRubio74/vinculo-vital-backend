import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { FindMatchDto } from './dtos/find-match.dto';
import { ConnectionRequestDto } from './dtos/connection-request.dto';

@ApiTags('Matching')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('find')
  @ApiOperation({ summary: 'Buscar usuarios compatibles usando Gemini AI' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios compatibles' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async findMatches(@Body() body: FindMatchDto) {
    const { target, candidates } = body;
    return await this.matchingService.aiMatch(target, candidates, 5); 
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Obtener sugerencias diarias de coincidencias' })
  @ApiResponse({ status: 200, description: 'Sugerencias generadas correctamente' })
  async getSuggestions() {
    return this.matchingService.getDailySuggestions();
  }

  @Post('request')
  @ApiOperation({ summary: 'Enviar una solicitud de conexión a otro usuario' })
  @ApiResponse({ status: 201, description: 'Solicitud enviada correctamente' })
  async sendRequest(@Body() body: ConnectionRequestDto) {
    const { fromId, toId } = body;
    return this.matchingService.sendConnectionRequest(fromId, toId);
  }

  @Put('accept/:id')
  @ApiOperation({ summary: 'Aceptar una solicitud de conexión' })
  @ApiResponse({ status: 200, description: 'Solicitud aceptada correctamente' })
  async acceptRequest(@Param('id') requestId: string) {
    return this.matchingService.updateRequestStatus(requestId, 'accepted');
  }

  @Put('reject/:id')
  @ApiOperation({ summary: 'Rechazar una solicitud de conexión' })
  @ApiResponse({ status: 200, description: 'Solicitud rechazada correctamente' })
  async rejectRequest(@Param('id') requestId: string) {
    return this.matchingService.updateRequestStatus(requestId, 'rejected');
  }
}
