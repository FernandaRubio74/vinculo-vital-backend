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

  // datos generales, necesrios para ambos usuarios
  
  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ length: 20 })
  phone: string;

  //el perfil de cada usuario, incluyendo foto, genero, ciudad y biografia
  
  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ length: 100 })
  city: string; // para matching por ubicación

  @Column({ length: 100, default: 'El Salvador' })
  country: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // para personas mayores, primero cosas necearias para la experiencia y luego su perfil completo
  
  // Nivel de experiencia con tecnología (para matching)
  @Column({ type: 'int', nullable: true, default: 1 })
  techLevel: number; // 1-5 (1=principiante, 5=avanzado)

  // Movilidad (para saber qué actividades puede hacer)
  @Column({ type: 'varchar', length: 50, nullable: true })
  mobilityLevel: string; // 'high', 'medium', 'low'

  //para los jovenes voluntarios, varios para aplicar luego las recompensas
  
  // Habilidades que puede enseñar/compartir
  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  // Disponibilidad (CRÍTICO para matching)
  @Column({ type: 'jsonb', nullable: true })
  availability: {
    days?: string[]; // ['monday', 'wednesday', 'friday']
    timeSlots?: string[]; // ['morning', 'afternoon', 'evening']
  };

  // Experiencia previa como voluntario
  @Column({ default: false })
  hasVolunteerExperience: boolean;

  // AQUI DATOS PARA LOS MATCHINGS, EN BASE PREFERENCIAS DE CADA USUARIO
  
  // Preferencia de género para match (opcional, para comodidad)
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  preferredGender: Gender;

  //estado del usuario
  
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ default: false })
  profileCompleted: boolean;

  //estadisticas de uso y recompensas para los jovenes voluntarios
  
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

  //relaciones para las bases de datos (intereses)
  
  @ManyToMany(() => Interest, (interest) => interest.users, { eager: true })
  @JoinTable({
    name: 'user_interests',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'interest_id', referencedColumnName: 'id' },
  })
  interests: Interest[];

  //funciones para edad y verificaciones
  
  getAge(): number {
    if (!this.birthDate) return 0;

    const today = new Date();
    const birthDate = new Date(this.birthDate);
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

  // Verificar si está listo para matching
  isReadyForMatching(): boolean {
    return (
      this.onboardingCompleted &&
      this.interests &&
      this.interests.length > 0 &&
      this.city !== null &&
      (this.userType === 'young' ? this.availability !== null : true)
    );
  }
}