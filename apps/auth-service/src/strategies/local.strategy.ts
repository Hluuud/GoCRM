import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersRepository } from '../modules/users/users.repository';
import * as argon2 from 'argon2';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly usersRepository: UsersRepository) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');
    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) throw new UnauthorizedException('Credenciais inválidas.');
    return user;
  }
}
