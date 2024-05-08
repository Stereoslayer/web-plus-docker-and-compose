import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from './local.guard';

@Controller()
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  async signin(@Req() req) {
    return this.authService.auth(req.user);
  }

  @Post('signup')
  async signup(@Body() user) {
    await this.usersService.create(user);
    return this.authService.auth(user);
  }
}
