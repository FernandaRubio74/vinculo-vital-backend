import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class NotificationCallDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del usuario que recibirá la notificación',
  })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  userId: string;

  @ApiProperty({
    example: 'Tienes una llamada entrante de Juan Pérez',
    description: 'Mensaje de la notificación de llamada',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  message: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6g7-8901-bcde-fg2345678901',
    description: 'UUID del usuario que está llamando',
  })
  @IsUUID('4', { message: 'El caller debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El caller es requerido' })
  caller: string;
}
