import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'

import { TasksService } from '../tasks.service'
import { TaskRepository } from '../task.repository'
import { GetTasksFilterDTO } from '../dto/get-tasks-filter.dto'
import { TaskStatus } from '../task-status.enum'
import { CreateTaskDTO } from '../dto/create-task.dto'

const mockUser = {
  username: 'testuser',
  id: 12,
}

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
})

describe('TasksService', () => {
  let tasksService
  let taskRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TasksService, { provide: TaskRepository, useFactory: mockTaskRepository }],
    }).compile()

    tasksService = await module.get<TasksService>(TasksService)
    taskRepository = await module.get<TaskRepository>(TaskRepository)
  })

  describe('getTasks', () => {
    it('get all tasks from repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue')
      const filters: GetTasksFilterDTO = { status: TaskStatus.OPEN, search: 'Test' }

      expect(taskRepository.getTasks).not.toHaveBeenCalled()
      const result = await tasksService.getTasks(filters, mockUser)
      expect(taskRepository.getTasks).toHaveBeenCalled()
      expect(result).toEqual('someValue')
    })
  })

  describe('getTaskById', () => {
    it('calls task repository findOne and successfully retrieve and return task', async () => {
      const mockTask = { title: 'Test title', description: 'Description' }
      taskRepository.findOne.mockResolvedValue(mockTask)

      expect(taskRepository.findOne).not.toHaveBeenCalled()
      const result = await tasksService.getTaskById(1, mockUser)
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: mockUser.id } })
      expect(result).toEqual(mockTask)
    })

    it('throws error as task is not found', () => {
      taskRepository.findOne.mockResolvedValue(undefined)

      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        new NotFoundException('Task with ID: "1" not found')
      )
    })
  })

  describe('createTask', () => {
    it('calls task repository createTask and return result', async () => {
      const createTaskDTO: CreateTaskDTO = { title: 'Test title', description: 'Description' }
      taskRepository.createTask.mockResolvedValue('someTask')

      expect(taskRepository.createTask).not.toHaveBeenCalled()
      const result = await tasksService.createTask(createTaskDTO, mockUser)
      expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDTO, mockUser)
      expect(result).toEqual('someTask')
    })
  })

  describe('deleteTask', () => {
    it('call task repository deleteTask to dele a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 })

      expect(taskRepository.delete).not.toHaveBeenCalled()
      await tasksService.deleteTask(1, mockUser)
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id })
    })

    it('throws error as task could not be found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 })

      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        new NotFoundException('Task with ID: "1" not found')
      )
    })
  })

  describe('updateTaskStatus', () => {
    it('updates task status', async () => {
      const save = jest.fn().mockResolvedValue(true)
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.IN_PROGRESS,
        save,
      })

      expect(tasksService.getTaskById).not.toHaveBeenCalled()
      expect(save).not.toHaveBeenCalled()
      const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser)
      expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser)
      expect(save).toHaveBeenCalled()
      expect(result.status).toEqual(TaskStatus.DONE)
    })
  })
})
