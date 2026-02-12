import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('performance_events') // 表名
export class PerformanceEvent {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  type!: string // e.g. 'page_load', 'resource'

  @Column()
  name!: string // e.g. 'FCP', 'LCP'

  @Column('float')
  value!: number // 数值

  @Column()
  unit!: string // 单位

  @Column({ name: 'page_url', type: 'text', nullable: true })
  pageUrl!: string

  @Column({ name: 'page_title', nullable: true })
  pageTitle!: string

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string

  @Column('json', { nullable: true })
  detail!: any // 扩展详情

  @Column({ type: 'bigint' })
  timestamp!: number // 上报时间戳

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date // 入库时间
}
