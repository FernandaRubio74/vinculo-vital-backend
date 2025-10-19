import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInterestsDto {
  @ApiProperty({
    example: [1, 2, 5, 8, 12],
    description: 'Array de IDs de intereses',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debes seleccionar al menos un interés' })
  @IsInt({ each: true, message: 'Cada ID debe ser un número entero' })
  interestIds: number[];
}