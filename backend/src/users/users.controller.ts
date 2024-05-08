import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  async getMyProfile(@Req() req): Promise<User> {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  async updateMyProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  async getMyWishes(@Req() req): Promise<Wish[]> {
    return this.usersService.findWishes(req.user.id);
  }
  @Get(':username')
  async getOtherProfile(@Param('username') username: string): Promise<User> {
    return await this.usersService.findByName(username);
  }
  @Get(':username/wishes')
  async getOtherWishes(@Param('username') username: string): Promise<Wish[]> {
    const user = await this.usersService.findByName(username);
    return await this.usersService.findWishes(user.id);
  }

  @Post('find')
  async findUser(@Body() { query }): Promise<User[]> {
    return this.usersService.find(query);
  }

  @Delete(':id')
  async removeOne(@Param('id') id: string) {
    return this.usersService.removeOne(+id);
  }
}
