import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'

import { User } from '../auth/user.entity'

import { TaskStatus } from './task-status.enum'

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column()
  description: string

  @Column()
  status: TaskStatus

  @ManyToOne(
    () => User,
    (user) => user.tasks,
    { eager: false }
  )
  user: User

  @Column()
  userId: number
}
