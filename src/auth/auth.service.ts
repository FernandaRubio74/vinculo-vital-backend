import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from '../users/entities/user.entity';
import { Interest } from '../users/entities/interest.entity';
import { RegisterElderlyDto } from 'src/users/dtos/register-elderly.dto';
import { RegisterYoungDto } from 'src/users/dtos/register-volunteer.dto';
import { LoginDto } from 'src/users/dtos/login.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Interest)
    private interestsRepository: Repository<Interest>,
    private jwtService: JwtService,
  ) {}

  //Adulto mayor - registro

  async registerElderly(registerElderlyDto: RegisterElderlyDto) {
    // 1. Verificar email único
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerElderlyDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Verificar teléfono único
    const existingPhone = await this.usersRepository.findOne({
      where: { phone: registerElderlyDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    // 3. Validar edad (mínimo 60 años)
    const age = this.calculateAge(new Date(registerElderlyDto.birthDate));
    if (age < 60) {
      throw new BadRequestException(
        'Debes tener al menos 60 años para registrarte como adulto mayor',
      );
    }

    // 4. Validar que los intereses existan
    const interests = await this.interestsRepository.findBy({
      id: In(registerElderlyDto.interestIds),
      isActive: true,
    });

    if (interests.length !== registerElderlyDto.interestIds.length) {
      throw new BadRequestException('Algunos intereses seleccionados no son válidos');
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(registerElderlyDto.password, 10);

    // 6. Crear usuario elderly
    const { interestIds, ...elderlyData } = registerElderlyDto;

    const user = this.usersRepository.create({
      ...elderlyData,
      userType: UserType.ELDER,
      password: hashedPassword,
      interests,
      onboardingCompleted: true, // Ya completó el onboarding al registrarse
      profileCompleted: true,
      country: elderlyData.country || 'El Salvador',
      techLevel: elderlyData.techLevel || 1,
    });

    const savedUser = await this.usersRepository.save(user);

    // 7. Generar token
    const token = this.generateToken(savedUser);

    // 8. Cargar relaciones
    const userWithRelations = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['interests'],
    });

    if (!userWithRelations) {
      throw new BadRequestException('Error al cargar el usuario');
    }

    const { password, ...userWithoutPassword } = userWithRelations;

    return {
      user: userWithoutPassword,
      token,
      message: '¡Bienvenido a VínculoVital! Tu perfil está listo para conectar',
    };
  }

  //Voluntario joven - Registro

  async registerYoung(registerYoungDto: RegisterYoungDto) {
    // 1. Verificar email único
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerYoungDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Verificar teléfono único
    const existingPhone = await this.usersRepository.findOne({
      where: { phone: registerYoungDto.phone },
    });

    if (existingPhone) {
      throw new ConflictException('El teléfono ya está registrado');
    }

    // 3. Validar edad (mínimo 16 años)
    const age = this.calculateAge(new Date(registerYoungDto.birthDate));
    if (age < 16) {
      throw new BadRequestException(
        'Debes tener al menos 16 años para ser voluntario',
      );
    }

    // 4. Validar disponibilidad
    if (
      !registerYoungDto.availability?.days ||
      registerYoungDto.availability.days.length === 0
    ) {
      throw new BadRequestException(
        'Debes seleccionar al menos un día de disponibilidad',
      );
    }

    if (
      !registerYoungDto.availability?.timeSlots ||
      registerYoungDto.availability.timeSlots.length === 0
    ) {
      throw new BadRequestException(
        'Debes seleccionar al menos un horario de disponibilidad',
      );
    }

    // 5. Validar intereses
    const interests = await this.interestsRepository.findBy({
      id: In(registerYoungDto.interestIds),
      isActive: true,
    });

    if (interests.length !== registerYoungDto.interestIds.length) {
      throw new BadRequestException('Algunos intereses seleccionados no son válidos');
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(registerYoungDto.password, 10);

    // 7. Crear usuario young
    const { interestIds, ...youngData } = registerYoungDto;

    const user = this.usersRepository.create({
      ...youngData,
      userType: UserType.YOUNG,
      password: hashedPassword,
      interests,
      onboardingCompleted: true,
      profileCompleted: true,
      country: youngData.country || 'El Salvador',
      hasVolunteerExperience: youngData.hasVolunteerExperience || false,
    });

    const savedUser = await this.usersRepository.save(user);

    // 8. Generar token
    const token = this.generateToken(savedUser);

    // 9. Cargar relaciones
    const userWithRelations = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['interests'],
    });

    if (!userWithRelations) {
      throw new BadRequestException('Error al cargar el usuario');
    }

    const { password, ...userWithoutPassword } = userWithRelations;

    return {
      user: userWithoutPassword,
      token,
      message: '¡Bienvenido voluntario! Gracias por unirte a VínculoVital',
    };
  }

  //login para ambos tipos de usuario

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['interests'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo. Contacta soporte.');
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
      message: `¡Bienvenido de nuevo, ${user.fullName}!`,
    };
  }

  logout() {
    return { message: 'Logout exitoso' };
  }

  //funciones 

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