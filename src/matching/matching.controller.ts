import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { FindMatchDto } from './dtos/find-match.dto';
import { ConnectionRequestDto } from './dtos/connection-request.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Matching')
@Controller('matching')
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly usersService: UsersService,
  ) {}

  @Post('find')
  @ApiOperation({ summary: 'Buscar usuarios compatibles usando Gemini AI' })
  @ApiBody({ description: 'Envía target/candidates o targetId + optional candidateIds', type: FindMatchDto })
  @ApiResponse({ status: 200, description: 'Lista de usuarios compatibles' })
  async findMatches(@Body() body: FindMatchDto) {
    // la lógica que ya tienes: si pasan IDs se cargan desde BD, si pasan perfiles se usan directamente.
    let targetProfile = body.target as any;
    let candidatesProfiles = body.candidates as any[];

    // si se pasa targetId, cargar desde BD
    if (!targetProfile && body.targetId) {
      const u = await this.usersService.findOne(body.targetId);
      if (!u) throw new HttpException('Usuario objetivo no encontrado', HttpStatus.NOT_FOUND);
      targetProfile = {
        id: u.id,
        name: (u as any).fullName ?? undefined,
        age: (u as any).age ?? undefined,
        interests: (u.interests ?? []).map((i: any) => i.name),
        shortBio: (u as any).bio ?? undefined,
      };
    }

    // candidateIds desde BD
    if ((!candidatesProfiles || candidatesProfiles.length === 0) && body.candidateIds) {
      const ids: string[] = body.candidateIds;
      candidatesProfiles = [];
      for (const id of ids) {
        const cu = await this.usersService.findOne(id);
        if (!cu) continue;
        candidatesProfiles.push({
          id: cu.id,
          name: (cu as any).fullName ?? undefined,
          age: (cu as any).age ?? undefined,
          interests: (cu.interests ?? []).map((i: any) => i.name),
          shortBio: (cu as any).bio ?? undefined,
        });
      }
    }

    // fallback: todos los usuarios activos
    if ((!candidatesProfiles || candidatesProfiles.length === 0) && targetProfile?.id) {
      const all = await this.usersService.findAll();
      candidatesProfiles = all
        .filter((u) => u.id !== targetProfile.id)
        .map((u) => ({
          id: u.id,
          name: (u as any).fullName ?? undefined,
          age: (u as any).age ?? undefined,
          interests: (u.interests ?? []).map((i: any) => i.name),
          shortBio: (u as any).bio ?? undefined,
        }));
    }

    if (!targetProfile) throw new HttpException('Target no proporcionado', HttpStatus.BAD_REQUEST);

    return this.matchingService.aiMatch(targetProfile, candidatesProfiles || [], 5);
  }

  @Get('suggestions/:userId')
  @ApiOperation({
    summary: 'Obtener sugerencias diarias de coincidencias para un usuario',
  })
  @ApiParam({ name: 'userId', required: true, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Sugerencias generadas correctamente' })
  async getSuggestions(
    @Param('userId') userId: string,
    @Query('topK') topK?: string,
  ) {
    const k = topK ? parseInt(topK, 10) : 5;
    
    // 1. Obtiene los MatchResult de la IA (ej. [{id: '123', score: 90}, ...])
    const matchResults = await this.matchingService.getDailySuggestions(
      userId,
      k,
    );

    if (!matchResults || matchResults.length === 0) {
      return { message: 'No hay sugerencias por ahora', data: [] };
    }

    // 2. Extrae solo los IDs de los usuarios sugeridos
    const userIds = matchResults.map((match) => match.id);

    // 3. 🚨 LA SOLUCIÓN DEL BACKEND:
    // Busca los perfiles completos de usuario usando los IDs
    // (Necesitas añadir 'findMultipleByIds' a tu UsersService)
    const userProfiles = await this.usersService.findMultipleByIds(userIds);

    // 4. (Opcional) Combina los perfiles completos con los datos de matching (score/explanation)
    const detailedSuggestions = userProfiles.map((profile) => {
      const matchInfo = matchResults.find((m) => m.id === profile.id);
      // Oculta la contraseña y otros datos sensibles
      const { password, ...safeProfile } = profile;
      return {
        ...safeProfile, // El UserModel completo (sin password)
        matchScore: matchInfo?.score ?? 0,
        matchExplanation: matchInfo?.explanation ?? 'N/A',
      };
    });

    // 5. Devuelve los perfiles completos
    return {
      message: 'Sugerencias obtenidas',
      data: detailedSuggestions, // 👈 Ahora 'data' contiene UserModels
    };
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
