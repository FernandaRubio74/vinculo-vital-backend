import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConnectionRequestDto {
  @ApiProperty({ example: 'u001', description: 'ID del usuario que envía la solicitud' })
  @IsString()
  @IsNotEmpty()
  fromId: string;

  @ApiProperty({ example: 'u002', description: 'ID del usuario que recibe la solicitud' })
  @IsString()
  @IsNotEmpty()
  toId: string;
}