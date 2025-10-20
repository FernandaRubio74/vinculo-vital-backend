import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsObject, IsOptional } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que recibirá la notificación',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;

  @ApiProperty({
    example: NotificationType.CALL,
    enum: NotificationType,
    description: 'Tipo de notificación',
  })
  @IsEnum(NotificationType, { message: 'El tipo debe ser CALL o REWARD' })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  type: NotificationType;

  @ApiProperty({
    example: 'Tienes una nueva llamada entrante',
    description: 'Mensaje de la notificación',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  message: string;

  @ApiProperty({
    example: { callerId: 'abc123', duration: 30 },
    description: 'Metadata adicional de la notificación',
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
