// entities/event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: string

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>

  // 方案1：设为可空
  @Column({ nullable: true })
  userId: number

  @CreateDateColumn()
  timestamp: Date

  @Column({ default: 0 })
  priority: number
}
