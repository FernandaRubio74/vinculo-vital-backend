import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../users/entities/user.entity';
import { RegisterElderlyDto } from 'src/users/dtos/register-elderly.dto';
import { RegisterYoungDto } from 'src/users/dtos/register-volunteer.dto';
import { LoginDto } from 'src/users/dtos/login.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  //para optimizar el registro se divide por usuario, pero se usa el mismo entity de user. En la tabla de postgre tengo la identificaci[n del tipo de usuario]

  //para adulto mayor
  async registerElderly(registerElderlyDto: RegisterElderlyDto) {
    // Verificar email único
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerElderlyDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    //Verificat teléfono único
    const existingPhone = await this.usersRepository.findOne({
      where: { phone: registerElderlyDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    // esto no se si lo dejamos
    const age = this.calculateAge(new Date(registerElderlyDto.birthDate));
    if (age < 50) {
      throw new BadRequestException(
        'Debes tener al menos 50 años para registrarte como adulto mayor',
      );
    }

    // proteccion de la contraseña (Hash password)
    const hashedPassword = await bcrypt.hash(registerElderlyDto.password, 10);

    // Crear usuario elderly
    const user = this.usersRepository.create({
      userType: UserType.ELDER,
      ...registerElderlyDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Generar token
    const token = this.generateToken(savedUser);

    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      token,
      message: 'Registro exitoso. Bienvenido a VínculoVital',
    };
  }

  // registro para voluntarios

  async registerYoung(registerYoungDto: RegisterYoungDto) {
    // Verificar email único
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerYoungDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar teléfono único
    const existingPhone = await this.usersRepository.findOne({
      where: { youngPhone: registerYoungDto.youngPhone },
    });

    if (existingPhone) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    // Validar edad (mínimo 16 años)
    const age = this.calculateAge(new Date(registerYoungDto.youngBirthDate));
    if (age < 16) {
      throw new BadRequestException(
        'Debes tener al menos 16 años para ser voluntario',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerYoungDto.password, 10);

    // Crear usuario young
    const user = this.usersRepository.create({
      userType: UserType.YOUNG,
      fullName: registerYoungDto.fullName,
      email: registerYoungDto.email,
      password: hashedPassword,
      profilePhotoUrl: registerYoungDto.profilePhotoUrl,
      youngBirthDate: registerYoungDto.youngBirthDate,
      youngPhone: registerYoungDto.youngPhone,
      city: registerYoungDto.city,
      bio: registerYoungDto.bio,
      skills: registerYoungDto.skills,
      availability: registerYoungDto.availability,
    });

    const savedUser = await this.usersRepository.save(user);

    // Generar token
    const token = this.generateToken(savedUser);

    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      token,
      message: '¡Bienvenido voluntario! Gracias por unirte',
    };
  }

  // en el login se usan los mismo datos, asi que reutilizo el dto para ambos tipos de usuario

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['interests'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message: 'Login exitoso',
    };
  }

  //funciones para generar token y calcular edad

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    return this.jwtService.sign(payload);
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}