import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ActionType } from '../enums/action-type.enum';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Business logic methods
  isRecentAction(hoursAgo: number = 24): boolean {
    const now = new Date();
    const hoursDiff = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= hoursAgo;
  }

  getActionLabel(): string {
    const labels: Record<ActionType, string> = {
      [ActionType.CALL]: 'Llamada realizada',
      [ActionType.REWARD]: 'Recompensa obtenida',
      [ActionType.LOGIN]: 'Inicio de sesión',
      [ActionType.LOGOUT]: 'Cierre de sesión',
      [ActionType.MATCH]: 'Nuevo match',
      [ActionType.CONNECTION]: 'Nueva conexión',
      [ActionType.PROFILE_UPDATE]: 'Perfil actualizado',
    };
    return labels[this.actionType] || 'Acción desconocida';
  }
}
