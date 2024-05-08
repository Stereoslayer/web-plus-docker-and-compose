import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(user: CreateUserDto): Promise<CreateUserDto> {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }
  async findByName(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async find(param: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: [{ email: param }, { username: param }],
    });
  }

  async findWishes(id: number): Promise<Wish[]> {
    const wishes = await this.usersRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        wishes: true,
      },
    });
    if (!wishes) {
      throw new NotFoundException('Подарки не найдены');
    }
    return wishes.wishes;
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const useremail = await this.find(updateUserDto.email);
      if (useremail) {
        throw new BadRequestException(
          'Пользователь с таким адресом почты уже существует',
        );
      }
    }
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const username = await this.find(updateUserDto.username);
      if (username) {
        throw new BadRequestException(
          'Пользователь с таким именем уже существует',
        );
      }
    }
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      const newPassword = await bcrypt.hash(updateUserDto.password, salt);
      return await this.usersRepository.update(id, {
        ...updateUserDto,
        password: newPassword,
        updatedAt: new Date(),
      });
    } else {
      return await this.usersRepository.update(id, {
        ...updateUserDto,
        updatedAt: new Date(),
      });
    }
  }

  async removeOne(id: number) {
    return await this.usersRepository.delete(id);
  }
}
