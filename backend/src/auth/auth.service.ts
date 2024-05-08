import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByName(username);
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        const { password, ...result } = user;
        return result;
      } else {
        throw new UnauthorizedException('Неверное имя пользователя или пароль');
      }
    }
    return null;
  }
}
