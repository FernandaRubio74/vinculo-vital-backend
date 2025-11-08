import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Interest } from './entities/interest.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { MatchingService } from 'src/matching/matching.service';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Interest)
    private interestsRepository: Repository<Interest>,
  ) {}

//funciones basicas de user

  async findAll(userType?: string): Promise<User[]> {
    const where: any = { isActive: true };
    if (userType) {
      where.userType = userType;
    }

    const users = await this.usersRepository.find({
      where,
      relations: ['interests'],
      order: { createdAt: 'DESC' },
    });

    // Remover passwords
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['interests'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['interests'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  //funciones para ver intereses

  async getInterests(): Promise<Interest[]> {
    return await this.interestsRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async getInterestsByCategory(): Promise<Record<string, Interest[]>> {
    const interests = await this.getInterests();

    return interests.reduce((acc, interest) => {
      if (!acc[interest.category]) {
        acc[interest.category] = [];
      }
      acc[interest.category].push(interest);
      return acc;
    }, {} as Record<string, Interest[]>);
  }

  async findMultipleByIds(ids: string[]): Promise<User[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    return this.usersRepository.find({
      where: {
        id: In(ids),
        isActive: true, // Asegúrate de sugerir solo usuarios activos
      },
      relations: ['interests'], // Carga los intereses
    });
  }
}