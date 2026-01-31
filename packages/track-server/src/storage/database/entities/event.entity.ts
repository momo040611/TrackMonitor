// entities/event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: string

  @Column()
  url: string

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>

  @Column({ nullable: true })
  userId: number

  @CreateDateColumn()
  timestamp: Date

  @Column({ default: 0 })
  priority: number
}
