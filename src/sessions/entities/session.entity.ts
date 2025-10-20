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
import { Connection } from '../../connections/entities/connection.entity';
import { Message } from './message.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

export enum ActivityType {
  COOKING = 'cooking',
  CRAFTS = 'crafts',
  STORIES = 'stories',
  MUSIC = 'music',
  GAMES = 'games',
  CONVERSATION = 'conversation',
  TECHNOLOGY_HELP = 'technology_help',
  READING = 'reading',
  EXERCISE = 'exercise',
  OTHER = 'other',
}

export enum VideoStatus {
  NOT_STARTED = 'not_started',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ENDED = 'ended',
  FAILED = 'failed',
}

export enum VideoQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Connection)
  @JoinColumn({ name: 'connection_id' })
  connection: Connection;

  @Column('uuid')
  connectionId: string;

  // ============= ACTIVIDAD =============

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column({ length: 200, nullable: true })
  activityTitle: string;

  @Column({ type: 'text', nullable: true })
  activityDescription: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  // ============= VIDEOLLAMADA =============

  @Column({ nullable: true })
  videoRoomSid: string;

  @Column({ nullable: true })
  videoRoomName: string;

  @Column({
    type: 'enum',
    enum: VideoStatus,
    default: VideoStatus.NOT_STARTED,
  })
  videoStatus: VideoStatus;

  @Column({ type: 'text', nullable: true })
  videoTokenElder: string;

  @Column({ type: 'text', nullable: true })
  videoTokenYoung: string;

  @Column({ type: 'timestamp', nullable: true })
  videoStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  videoEndedAt: Date;

  @Column({ type: 'int', nullable: true })
  videoDurationSeconds: number;

  @Column({
    type: 'enum',
    enum: VideoQuality,
    nullable: true,
  })
  videoQuality: VideoQuality;

  @Column({ default: false })
  videoIsRecorded: boolean;

  @Column({ nullable: true })
  videoRecordingUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  videoTechnicalData: {
    elderBitrate?: number;
    youngBitrate?: number;
    packetLoss?: number;
    reconnections?: number;
  };

  // ============= CHAT =============

  @Column({ default: true })
  chatEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @Column({ type: 'int', default: 0 })
  unreadCountElder: number;

  @Column({ type: 'int', default: 0 })
  unreadCountYoung: number;

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];

  // ============= FEEDBACK =============

  @Column({ type: 'int', nullable: true })
  elderRating: number;

  @Column({ type: 'text', nullable: true })
  elderFeedback: string;

  @Column({ type: 'int', nullable: true })
  youngRating: number;

  @Column({ type: 'text', nullable: true })
  youngFeedback: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ============= HELPERS =============

  isVideoActive(): boolean {
    return this.videoStatus === VideoStatus.ACTIVE;
  }

  canStartVideo(): boolean {
    return (
      this.status === SessionStatus.IN_PROGRESS &&
      this.videoStatus === VideoStatus.NOT_STARTED
    );
  }

  isInProgress(): boolean {
    return this.status === SessionStatus.IN_PROGRESS;
  }

  canBeCancelled(): boolean {
    return this.status === SessionStatus.SCHEDULED;
  }
}