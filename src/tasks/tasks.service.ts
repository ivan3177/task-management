import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '../auth/user.entity'

import { CreateTaskDTO } from './dto/create-task.dto'
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto'
import { TaskRepository } from './task.repository'
import { Task } from './task.entity'
import { TaskStatus } from './task-status.enum'

@Injectable()
export class TasksService {
  constructor(@InjectRepository(TaskRepository) private taskRepository: TaskRepository) {}

  getTasks = async (filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> =>
    this.taskRepository.getTasks(filterDTO, user)

  getTaskById = async (id: number, user: User): Promise<Task> => {
    const found = await this.taskRepository.findOne({ where: { id, userId: user.id } })

    if (!found) {
      throw new NotFoundException(`Task with ID: "${id}" not found`)
    }

    return found
  }

  createTask = async (createTaskDTO: CreateTaskDTO, user: User): Promise<Task> =>
    this.taskRepository.createTask(createTaskDTO, user)

  updateTaskStatus = async (id: number, status: TaskStatus, user: User): Promise<Task> => {
    const task = await this.getTaskById(id, user)
    task.status = status
    await task.save()
    return task
  }

  deleteTask = async (id: number, user: User): Promise<void> => {
    const found = await this.getTaskById(id, user)

    await this.taskRepository.remove(found)
  }
}
