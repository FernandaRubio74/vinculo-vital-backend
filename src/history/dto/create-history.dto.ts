import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsObject,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ActionType } from '../enums/action-type.enum';

export class CreateHistoryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que realizó la acción',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;

  @ApiProperty({
    example: ActionType.CALL,
    enum: ActionType,
    description: 'Tipo de acción realizada',
  })
  @IsEnum(ActionType, {
    message: 'El tipo de acción debe ser uno de los valores permitidos',
  })
  @IsNotEmpty({ message: 'El tipo de acción es requerido' })
  actionType: ActionType;

  @ApiProperty({
    example: 'El usuario realizó una llamada de 30 minutos',
    description: 'Descripción de la acción',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description: string;

  @ApiPropertyOptional({
    example: { duration: 30, callType: 'video' },
    description: 'Metadata adicional de la acción',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
