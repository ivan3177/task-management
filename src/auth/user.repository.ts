import { Repository, EntityRepository } from 'typeorm'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { User } from './user.entity'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  signUp = async (authCredentialsDTO: AuthCredentialsDTO): Promise<void> => {
    const { username, password } = authCredentialsDTO

    const user = new User()
    user.username = username
    user.salt = await bcrypt.genSalt()
    user.password = await this.hashPassword(password, user.salt)

    try {
      await user.save()
    } catch (error) {
      switch (error.code) {
        case '23505': // duplicate username
          throw new ConflictException('User already exists')
        default:
          throw new InternalServerErrorException()
      }
    }
  }

  validateUserPassword = async (authCredentialsDTO: AuthCredentialsDTO): Promise<string> => {
    const { username, password } = authCredentialsDTO
    const user = await this.findOne({ username })

    if (user && (await user.validatePassword(password))) {
      return user.username
    }
    return null
  }

  private hashPassword = async (password: string, salt: string): Promise<string> =>
    bcrypt.hash(password, salt)
}
