import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'

import { UserRepository } from './user.repository'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'
import { JwtPayload } from './jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  signUp = async (authCredentialsDTO: AuthCredentialsDTO): Promise<void> =>
    this.userRepository.signUp(authCredentialsDTO)

  signIn = async (authCredentialsDTO: AuthCredentialsDTO): Promise<{ accessToken: string }> => {
    const username = await this.userRepository.validateUserPassword(authCredentialsDTO)

    if (!username) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload: JwtPayload = { username }
    const accessToken = await this.jwtService.sign(payload)

    return { accessToken }
  }
}
