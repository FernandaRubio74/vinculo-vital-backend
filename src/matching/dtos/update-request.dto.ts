import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateRequestDto {
  @ApiProperty({ example: 'req-1729382910', description: 'ID de la solicitud de conexión' })
  @IsString()
  requestId: string;

  @ApiProperty({ example: 'accepted', enum: ['accepted', 'rejected'], description: 'Nuevo estado de la solicitud' })
  @IsIn(['accepted', 'rejected'])
  status: 'accepted' | 'rejected';
}
