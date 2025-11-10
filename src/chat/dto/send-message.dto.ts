import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID del receptor',
  })
  @IsUUID('4')
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    example: 'c1d2e3f4-g5h6-7890-ijkl-mn1234567890',
    description: 'UUID de la conexión',
  })
  @IsUUID('4')
  @IsNotEmpty()
  connectionId: string;

  @ApiProperty({
    example: '¡Hola! ¿Cómo estás hoy?',
    description: 'Contenido del mensaje',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, { message: 'El mensaje no puede exceder 1000 caracteres' })
  content: string;
}