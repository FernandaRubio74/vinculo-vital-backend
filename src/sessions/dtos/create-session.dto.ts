import {
  IsEnum,
  IsUUID,
  IsDateString,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '../entities/session.entity';

export class CreateSessionDto {
  @ApiProperty({ description: 'ID de la conexión' })
  @IsUUID()
  connectionId: string;

  @ApiProperty({ enum: ActivityType, example: ActivityType.COOKING })
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @ApiProperty({ 
    required: false,
    example: 'Cocinando pupusas tradicionales'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  activityTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  activityDescription?: string;

  @ApiProperty({ 
    example: '2025-01-20T15:00:00Z',
    description: 'Fecha y hora programada (ISO 8601)'
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  chatEnabled?: boolean;
}