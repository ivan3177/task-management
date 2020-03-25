import { Repository, EntityRepository } from 'typeorm'
import { Logger, InternalServerErrorException } from '@nestjs/common'

import { User } from '../auth/user.entity'

import { Task } from './task.entity'
import { CreateTaskDTO } from './dto/create-task.dto'
import { TaskStatus } from './task-status.enum'
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto'

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository')

  getTasks = async (filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> => {
    const { status, search } = filterDTO
    const query = this.createQueryBuilder('task')

    query.where('task.userId = :userId', { userId: user.id })

    if (status) {
      query.andWhere('task.status = :status', { status })
    }

    if (search) {
      query.andWhere('task.title LIKE :search OR task.description LIKE :search', {
        search: `%${search}%`,
      })
    }
    try {
      const tasks = await query.getMany()
      return tasks
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user ${user.username}. Filters: ${JSON.stringify(filterDTO)}`,
        error.stack
      )
      throw new InternalServerErrorException()
    }
  }

  createTask = async (createTaskDTO: CreateTaskDTO, user: User): Promise<Task> => {
    const { title, description } = createTaskDTO

    const task = new Task()
    task.title = title
    task.description = description
    task.status = TaskStatus.OPEN
    task.user = user

    try {
      await task.save()
    } catch (error) {
      this.logger.error(
        `Failed to create task for user ${user.username}. Data: ${JSON.stringify(createTaskDTO)}`,
        error.stack
      )
      throw new InternalServerErrorException()
    }

    delete task.user

    return task
  }
}
