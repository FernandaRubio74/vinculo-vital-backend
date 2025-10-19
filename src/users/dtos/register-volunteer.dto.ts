import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  IsOptional,
  Matches,
  MaxLength,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterYoungDto {
  // PASO 1: Datos básicos (Imagen 1)
  @ApiProperty({ example: 'Carlos Ramírez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'carlos@ejemplo.com' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password: string;

  // PASO 2: Foto y nombre (Imagen 2 - parte inicial)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePhotoUrl?: string;

  // PASO 3: Perfil completo (Imagen 3 - parte voluntario)
  @ApiProperty({ example: '2000-05-15' })
  @IsDateString()
  youngBirthDate: string;

  @ApiProperty({ example: '+50312345678' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'El teléfono debe tener formato internacional válido',
  })
  youngPhone: string;

  @ApiProperty({ example: 'San Salvador', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({
    example: 'Estudiante universitario apasionado por ayudar a los demás',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  // Habilidades (de la imagen 3)
  @ApiProperty({
    example: ['Música', 'Tecnología', 'Arte'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  // Disponibilidad (de la imagen 3)
  @ApiProperty({
    example: {
      days: ['monday', 'wednesday', 'friday'],
      timeSlots: ['morning', 'afternoon'],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  availability?: {
    days?: string[];
    timeSlots?: string[];
  };
}