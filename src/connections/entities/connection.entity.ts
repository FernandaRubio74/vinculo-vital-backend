import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ConnectionStatus {
  PENDING = 'pending',       // Solicitud enviada
  ACCEPTED = 'accepted',     // Solicitud aceptada
  ACTIVE = 'active',         // Conexión activa (después de primera sesión)
  REJECTED = 'rejected',     // Solicitud rechazada
  CANCELLED = 'cancelled',   // Cancelada por alguno
}

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Usuario adulto mayor
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'elder_id' })
  elder: User;

  @Column('uuid')
  elderId: string;

  // Usuario joven voluntario
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'young_id' })
  young: User;

  @Column('uuid')
  youngId: string;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING,
  })
  status: ConnectionStatus;

  // Puntuación del matching (0-100)
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  matchScore: number;

  // Explicación del matching (de la IA, gemini)
  @Column({ type: 'text', nullable: true })
  matchExplanation: string;

  // Estadísticas
  @Column({ type: 'int', default: 0 })
  totalSessions: number;

  @Column({ type: 'int', default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating: number;

  // Quien inició la solicitud
  @Column('uuid')
  initiatedBy: string;

  // Notas privadas
  @Column({ type: 'text', nullable: true })
  elderNotes: string;

  @Column({ type: 'text', nullable: true })
  youngNotes: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  firstSessionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helpers
  isPending(): boolean {
    return this.status === ConnectionStatus.PENDING;
  }

  isActive(): boolean {
    return this.status === ConnectionStatus.ACTIVE || this.status === ConnectionStatus.ACCEPTED;
  }

  canScheduleSession(): boolean {
    return this.status === ConnectionStatus.ACTIVE || this.status === ConnectionStatus.ACCEPTED;
  }
}