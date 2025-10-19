import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsDateString,
  IsOptional,
  Matches,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../users/entities/user.entity';

export class RegisterElderlyDto {
  // PASO 1: Datos básicos (Imagen 1)
  @ApiProperty({ example: 'María González' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: 'maria@ejemplo.com' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password: string;

  // PASO 2: Foto (opcional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePhotoUrl?: string;

  // PASO 3: Perfil completo (Imagen 3 - parte elderly)
  @ApiProperty({ example: '1945-03-20' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' })
  birthDate: string;

  @ApiProperty({ example: '+50312345678' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'El teléfono debe tener formato internacional válido',
  })
  phone: string;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'San Salvador', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'La Libertad', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({
    example: 'Me encanta cocinar y compartir historias de mi vida',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}