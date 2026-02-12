import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('events') // 通用日志表
export class EventEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  type!: string // 事件类型

  @Column('json', { nullable: true })
  data!: any // 事件数据

  @Column({ nullable: true })
  url!: string // 页面 URL

  @Column({ default: 0 })
  priority!: number // 优先级

  @Column({ default: 0 })
  userId!: number // 用户 ID

  @Column({ type: 'bigint', nullable: true })
  timestamp!: number // 上报时间戳

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date // 入库时间
}
