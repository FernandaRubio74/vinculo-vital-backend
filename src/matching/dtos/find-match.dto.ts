import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

class UserProfileDto {
  @ApiProperty({ example: 'uuid-usuario-123', description: 'ID único del usuario' })
  @IsString()
  id: string;

  @ApiProperty({ example: ['música', 'cine', 'lectura'], description: 'Lista de intereses del usuario' })
  @IsArray()
  @IsNotEmpty()
  interests: string[];

  @ApiPropertyOptional({ example: 'Me encanta conversar y compartir historias' })
  @IsOptional()
  @IsString()
  shortBio?: string;
}

export class FindMatchDto {
  @ApiPropertyOptional({ type: UserProfileDto, description: 'Usuario objetivo (opcional si se usa targetId)' })
  @IsOptional()
  @IsObject()
  target?: UserProfileDto;

  @ApiPropertyOptional({ type: [UserProfileDto], description: 'Lista de candidatos (opcional si se usan candidateIds)' })
  @IsOptional()
  @IsArray()
  candidates?: UserProfileDto[];

  @ApiPropertyOptional({ example: 'uuid-usuario-123', description: 'ID del usuario objetivo (carga desde BD)' })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ example: ['uuid-cand-1','uuid-cand-2'], description: 'IDs de candidatos (carga desde BD)' })
  @IsOptional()
  @IsArray()
  candidateIds?: string[];
}
