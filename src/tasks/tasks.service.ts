import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { CreateTaskDTO } from './dto/create-task.dto'
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto'
import { TaskRepository } from './task.repository'
import { Task } from './task.entity'
import { TaskStatus } from './task-status.enum'

@Injectable()
export class TasksService {
  constructor(@InjectRepository(TaskRepository) private taskRepository: TaskRepository) {}

  getTasks = async (filterDTO: GetTasksFilterDTO): Promise<Task[]> => {
    return this.taskRepository.getTasks(filterDTO)
  }

  getTaskById = async (id: number): Promise<Task> => {
    const found = await this.taskRepository.findOne(id)

    if (!found) {
      throw new NotFoundException(`Task with ID: "${id}" not found`)
    }

    return found
  }

  createTask = async (createTaskDTO: CreateTaskDTO): Promise<Task> => {
    return this.taskRepository.createTask(createTaskDTO)
  }

  updateTaskStatus = async (id: number, status: TaskStatus): Promise<Task> => {
    const task = await this.getTaskById(id)
    task.status = status
    await task.save()
    return task
  }

  deleteTask = async (id: number): Promise<void> => {
    const found = await this.getTaskById(id)

    await this.taskRepository.remove(found)
  }
}
