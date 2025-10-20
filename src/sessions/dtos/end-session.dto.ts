import { IsInt, IsString, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VideoQuality } from '../entities/session.entity';

export class EndSessionDto {
  @ApiProperty({ 
    minimum: 1,
    maximum: 5,
    description: 'Calificación de la sesión (1-5)'
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ enum: VideoQuality, required: false })
  @IsOptional()
  @IsEnum(VideoQuality)
  videoQuality?: VideoQuality;
}