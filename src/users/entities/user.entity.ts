import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Interest } from './interest.entity';


export enum UserType {
  ELDER = 'elder',
  YOUNG = 'young',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_SAY = 'prefer_not_say',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  userType: UserType;

  // ============= CAMPOS COMUNES (AMBOS) =============
  
  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  // ============= CAMPOS ESPECÍFICOS DE ELDERLY =============
  
  @Column({ type: 'date', nullable: true })
  birthDate: Date; // Solo elderly lo requiere en registro

  @Column({ unique: true, length: 20, nullable: true })
  phone: string; // Solo elderly lo requiere

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string; // Estado/Departamento

  @Column({ type: 'text', nullable: true })
  bio: string;

  // ============= CAMPOS ESPECÍFICOS DE YOUNG =============
  
  @Column({ type: 'date', nullable: true })
  youngBirthDate: Date; // Fecha de nacimiento del voluntario

  @Column({ unique: true, length: 20, nullable: true })
  youngPhone: string;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[]; // Habilidades del voluntario

  // Disponibilidad horaria
  @Column({ type: 'jsonb', nullable: true })
  availability: {
    days?: string[]; // ['monday', 'wednesday', 'friday']
    timeSlots?: string[]; // ['morning', 'afternoon', 'evening']
  };

  // ============= CAMPOS COMUNES =============
  
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ default: false })
  profileCompleted: boolean; // Si completó el perfil después del registro

  // Estadísticas (solo para jóvenes)
  @Column({ type: 'int', default: 0 })
  totalVolunteerHours: number;

  @Column({ type: 'int', default: 0 })
  totalConnections: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación con intereses
  @ManyToMany(() => Interest, (interest) => interest.users)
  @JoinTable({
    name: 'user_interests',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'interest_id', referencedColumnName: 'id' },
  })
  interests: Interest[];

  // Helper: calcular edad
  getAge(): number {
    const date = this.userType === 'elder' ? this.birthDate : this.youngBirthDate;
    if (!date) return 0;

    const today = new Date();
    const birthDate = new Date(date);
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