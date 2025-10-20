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
  IsInt,
  ArrayMinSize,
  IsEnum,
  Min,
  Max,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../users/entities/user.entity';

export class RegisterYoungDto {

  //datos basicos
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

  //perfil foto opcional
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePhotoUrl?: string;

  // intereses enum para facilitar seleccion en frontend
  
  @ApiProperty({
    example: [1, 3, 7, 10],
    description: 'IDs de los intereses (mínimo 1)',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debes seleccionar al menos un interés' })
  @IsInt({ each: true })
  interestIds: number[];

  //biografia opcional
  
  @ApiProperty({
    example: 'Estudiante universitario apasionado por ayudar y aprender de los adultos mayores',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  //habilidades, para matchings y compartir con adultos mayores
  
  @ApiProperty({
    example: ['Música', 'Tecnología', 'Arte', 'Cocina'],
    description: 'Habilidades que puede compartir',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  // datos necesarios para contacto y matching
  
  @ApiProperty({ example: '2000-03-20' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: '+50387654321' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'El teléfono debe tener formato internacional válido',
  })
  phone: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'San Salvador', description: 'Ciudad (OBLIGATORIO)' })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'El Salvador', default: 'El Salvador' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  // la disponibilidad del voluntario joven ///IMPORTANTE PARA MATCHINGSS
  
  @ApiProperty({
    example: {
      days: ['monday', 'wednesday', 'friday'],
      timeSlots: ['morning', 'afternoon'],
    },
    description: 'Disponibilidad horaria (OBLIGATORIO)',
  })
  @IsObject()
  availability: {
    days: string[];
    timeSlots: string[];
  };

  //experiencia, para tener en cuenta en los matchings
  
  @ApiProperty({
    example: false,
    description: '¿Tienes experiencia previa como voluntario?',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasVolunteerExperience?: boolean;

  // preferencias para matchings , opcionale
  
  @ApiProperty({
    enum: Gender,
    required: false,
    description: 'Preferencia de género para el adulto mayor',
  })
  @IsOptional()
  @IsEnum(Gender)
  preferredGender?: Gender;
}