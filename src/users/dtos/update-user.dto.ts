import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false, example: 'Me encanta ayudar a los demás' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ required: false, example: 'San Salvador' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ required: false, example: 'El Salvador' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({
    required: false,
    example: {
      monday: ['09:00-12:00', '14:00-17:00'],
      wednesday: ['10:00-13:00'],
      friday: ['15:00-18:00'],
    },
    description: 'Disponibilidad horaria por día de la semana',
  })
  @IsOptional()
  @IsObject()
  availability?: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
}