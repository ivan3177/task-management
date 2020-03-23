import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common'

import { TasksService } from './tasks.service'
import { Task, TaskStatus } from './task.model'
import { CreateTaskDTO } from './dto/create-task.dto'
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto'

@Controller('tasks')
export class TasksController {
  constructor(private taskService: TasksService) {}

  @Get()
  getTasks(@Query() filterDTO: GetTasksFilterDTO): Task[] {
    if (Object.keys(filterDTO).length) {
      return this.taskService.getTasksWithFilters(filterDTO)
    }
    return this.taskService.getTasks()
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Task {
    return this.taskService.getTaskById(id)
  }

  @Post()
  createTask(@Body() createTaskDTO: CreateTaskDTO): Task {
    return this.taskService.createTask(createTaskDTO)
  }

  @Patch('/:id/:status')
  updateTaskStatus(@Param('id') id: string, @Body('status') status: TaskStatus): Task {
    return this.taskService.updateTaskStatus(id, status)
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): void {
    return this.taskService.deleteTask(id)
  }
}
