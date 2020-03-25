import { Test } from '@nestjs/testing'
import { UnauthorizedException } from '@nestjs/common'

import { JwtStrategy } from '../jwt.strategy'
import { UserRepository } from '../user.repository'
import { User } from '../user.entity'

const mockUserRepository = () => ({
  findOne: jest.fn(),
})

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy
  let userRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: UserRepository, useFactory: mockUserRepository }, JwtStrategy],
    }).compile()

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy)
    userRepository = await module.get<UserRepository>(UserRepository)
  })

  describe('validate', () => {
    it('validates and returns user based on jwt payload', async () => {
      const user = new User()
      user.username = 'Test'
      userRepository.findOne.mockResolvedValue(user)

      const result = await jwtStrategy.validate({ username: 'Test' })
      expect(userRepository.findOne).toHaveBeenCalledWith({ username: 'Test' })
      expect(result).toEqual(user)
    })

    it('throws unathorized exception as user cannot be found', () => {
      userRepository.findOne.mockResolvedValue(undefined)

      expect(jwtStrategy.validate({ username: 'Test' })).rejects.toThrow(UnauthorizedException)
    })
  })
})
