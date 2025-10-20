import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsInt } from 'class-validator';

export class NotificationRewardDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que recibirá la notificación',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la recompensa obtenida',
  })
  @IsInt({ message: 'El rewardId debe ser un número entero' })
  @IsNotEmpty({ message: 'El rewardId es requerido' })
  rewardId: number;

  @ApiProperty({
    example: '¡Felicidades! Has obtenido una nueva recompensa',
    description: 'Mensaje de la notificación de recompensa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  message: string;
}
