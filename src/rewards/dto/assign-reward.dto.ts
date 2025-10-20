import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsNotEmpty, Min } from 'class-validator';

export class AssignRewardDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que recibirá la recompensa',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la recompensa a asignar',
  })
  @IsInt({ message: 'El rewardId debe ser un número entero' })
  @IsNotEmpty({ message: 'El rewardId es requerido' })
  rewardId: number;

  @ApiProperty({
    example: 500,
    description: 'Puntos actuales del usuario (para validación)',
  })
  @IsInt({ message: 'Los puntos deben ser un número entero' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  points: number;
}
