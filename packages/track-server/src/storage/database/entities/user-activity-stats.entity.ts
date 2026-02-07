import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

@Entity('user_activity_stats')
export class UserActivityStatsEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  userId: number

  @Column({ type: 'date' })
  date: string // YYYY-MM-DD

  @Column({ default: 0 })
  eventCount: number

  @UpdateDateColumn()
  lastActiveTime: Date
}
