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
  IsArray,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../users/entities/user.entity';

export class RegisterElderlyDto {
  // basic info
  
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

  // foto de perfil, puede ser opcional //falta ponerlo para almacenar imagenes
  
  @ApiProperty({ required: false, description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  profilePhotoUrl?: string;

  //enum de intereses, para que sea mas facil elegirlos en el frontend
  @ApiProperty({
    example: [1, 2, 5, 8, 12],
    description: 'IDs de los intereses seleccionados (mínimo 1)',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debes seleccionar al menos un interés' })
  @IsInt({ each: true })
  interestIds: number[];

  // biografía opcional
  @ApiProperty({
    example: 'Me encanta cocinar platillos tradicionales y compartir historias de mi vida',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  //completar el perfil
  @ApiProperty({ example: '1950-05-15', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
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

  @ApiProperty({ example: 'San Salvador', description: 'Ciudad (OBLIGATORIO para matching)' })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'El Salvador', default: 'El Salvador' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  // preferencias y datos para matching
  
  @ApiProperty({
    example: 3,
    description: 'Nivel de experiencia con tecnología (1-5)',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  techLevel?: number;

  @ApiProperty({
    example: 'high',
    enum: ['high', 'medium', 'low'],
    required: false,
  })
  @IsOptional()
  @IsString()
  mobilityLevel?: string;

  @ApiProperty({
    enum: Gender,
    required: false,
    description: 'Preferencia de género para el voluntario',
  })
  @IsOptional()
  @IsEnum(Gender)
  preferredGender?: Gender;
}