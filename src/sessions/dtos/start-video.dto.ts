import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartVideoDto {
  @ApiProperty({ 
    default: false,
    description: 'Habilitar grabación de la videollamada'
  })
  @IsOptional()
  @IsBoolean()
  enableRecording?: boolean;
}