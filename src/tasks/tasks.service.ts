import { Injectable } from '@nestjs/common'
import * as uuid from 'uuid/v1'

import { Task, TaskStatus } from './task.model'

@Injectable()
export class TasksService {
  private tasks: Task[] = []

  getAllTasks = (): Task[] => this.tasks

  createTask = (title: string, description: string): Task => {
    const task: Task = {
      title,
      description,
      status: TaskStatus.OPEN,
      id: uuid(),
    }

    this.tasks.push(task)
    return task
  }
}
