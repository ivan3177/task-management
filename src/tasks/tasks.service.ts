import { Injectable } from '@nestjs/common'
import * as uuid from 'uuid/v1'

import { Task, TaskStatus } from './task.model'
import { CreateTaskDTO } from './dto/create-task.dto'
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto'

@Injectable()
export class TasksService {
  private tasks: Task[] = []

  getTasks = (): Task[] => this.tasks

  getTasksWithFilters = (filterDTO: GetTasksFilterDTO): Task[] => {
    const { status, search } = filterDTO

    let tasks = this.getTasks()

    if (status) {
      tasks = tasks.filter((task) => task.status == status)
    }
    if (search) {
      tasks = tasks.filter(
        (task) => task.title.includes(search) || task.description.includes(search)
      )
    }

    return tasks
  }

  getTaskById = (id: string): Task => this.tasks.find((task) => task.id === id)

  createTask = (createTaskDTO: CreateTaskDTO): Task => {
    const { title, description } = createTaskDTO

    const task: Task = {
      title,
      description,
      status: TaskStatus.OPEN,
      id: uuid(),
    }

    this.tasks.push(task)
    return task
  }

  updateTaskStatus = (id: string, status: TaskStatus): Task => {
    const task = this.getTaskById(id)
    task.status = status
    return task
  }

  deleteTask = (id: string): void => {
    this.tasks = this.tasks.filter((task) => task.id !== id)
  }
}
