import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  MaxLength,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({
    example: 'Tarjeta de Regalo Amazon $10',
    description: 'Nombre de la recompensa',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Tarjeta de regalo digital de Amazon por valor de $10 USD',
    description: 'Descripción detallada de la recompensa',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({
    example: 500,
    description: 'Puntos requeridos para obtener la recompensa',
  })
  @IsInt({ message: 'Los puntos deben ser un número entero' })
  @Min(1, { message: 'Los puntos requeridos deben ser al menos 1' })
  pointsRequired: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/amazon-gift-card.png',
    description: 'URL de la imagen de la recompensa',
  })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsOptional()
  imageUrl?: string;
}
