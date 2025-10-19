import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

class UserProfileDto {
  @ApiProperty({ example: 'u001', description: 'ID único del usuario' })
  @IsString()
  id: string;

  @ApiProperty({ example: ['música', 'cine', 'lectura'], description: 'Lista de intereses del usuario' })
  @IsArray()
  @IsNotEmpty()
  interests: string[];

  @ApiProperty({ example: 'Me encanta conversar y compartir historias', required: false })
  @IsOptional()
  @IsString()
  shortBio?: string;
}

export class FindMatchDto {
  @ApiProperty({ type: UserProfileDto, description: 'Usuario objetivo para el matching' })
  @IsObject()
  target: UserProfileDto;

  @ApiProperty({ type: [UserProfileDto], description: 'Lista de candidatos a evaluar' })
  @IsArray()
  @IsNotEmpty()
  candidates: UserProfileDto[];
}
