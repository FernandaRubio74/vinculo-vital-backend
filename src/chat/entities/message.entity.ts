import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Quien envía el mensaje
  @Column('uuid')
  senderId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  // Quien recibe el mensaje
  @Column('uuid')
  receiverId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  // ID de la conexión (para agrupar chats)
  @Column('uuid')
  connectionId: string;

  // Contenido del mensaje
  @Column({ type: 'text' })
  content: string;

  // Estado del mensaje
  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  // Métodos de utilidad
  isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  markAsRead(): void {
    this.status = MessageStatus.READ;
    this.readAt = new Date();
  }
}