import { Test } from '@nestjs/testing'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import { UserRepository } from '../user.repository'
import { AuthCredentialsDTO } from '../dto/auth-credentials.dto'
import { User } from '../user.entity'

const mockCredentialsDTO: AuthCredentialsDTO = { username: 'Test', password: 'Test' }

describe('UserRepository', () => {
  let userRepository

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile()

    userRepository = await module.get<UserRepository>(UserRepository)
  })

  describe('signUp', () => {
    let save

    beforeEach(() => {
      save = jest.fn()
      userRepository.create = jest.fn().mockReturnValue({ save })
    })

    it('successfully sign up the user', async () => {
      save.mockResolvedValue(true)
      expect(userRepository.signUp(mockCredentialsDTO)).resolves.not.toThrow()
    })

    it('throws a conflict exception as username already exists', () => {
      save.mockRejectedValue({ code: '23505' })
      expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(
        new ConflictException('User already exists')
      )
    })

    it('throws a internal server exception', () => {
      save.mockRejectedValue({ code: '23500' })
      expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(
        InternalServerErrorException
      )
    })
  })

  describe('validateUserPassword', () => {
    let user

    beforeEach(() => {
      userRepository.findOne = jest.fn()
      user = new User()
      user.username = 'Test'
      user.validatePassword = jest.fn()
    })

    it('returns username as validation successful', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(true)

      const result = await userRepository.validateUserPassword(mockCredentialsDTO)
      expect(result).toEqual('Test')
    })

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null)

      const result = await userRepository.validateUserPassword(mockCredentialsDTO)
      expect(user.validatePassword).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user)
      user.validatePassword.mockResolvedValue(false)

      const result = await userRepository.validateUserPassword(mockCredentialsDTO)
      expect(user.validatePassword).toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash')

      expect(bcrypt.hash).not.toHaveBeenCalled()
      const result = await userRepository.hashPassword('testPassword', 'testSalt')
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt')
      expect(result).toEqual('testHash')
    })
  })
})
