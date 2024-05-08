import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}
  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    const wish = await this.wishRepository.create({ ...createWishDto, owner });
    return this.wishRepository.save(wish);
  }

  async findAll(): Promise<Wish[]> {
    const wishes = await this.wishRepository.find();
    if (!wishes) {
      throw new NotFoundException('Подарки не найдены');
    }
    return wishes;
  }

  async findMany(itm): Promise<Wish[]> {
    return await this.wishRepository.findBy(itm);
  }

  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  async update(userId: number, wishId: number, updateWishDto: UpdateWishDto) {
    const wish = await this.findOne(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (userId != wish.owner.id) {
      throw new ForbiddenException('Невозможно отредактировать чужой подарок');
    }
    if (wish.raised && updateWishDto.price > 0) {
      throw new ForbiddenException(
        'Невозможно изменить стоимость, когда есть взносы',
      );
    }
    return await this.wishRepository.update(wishId, {
      ...updateWishDto,
      updatedAt: new Date(),
    });
  }

  async remove(userId: number, wishId: number) {
    const wish = await this.findOne(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (userId != wish.owner.id) {
      throw new ForbiddenException('Невозможно удалить чужой подарок');
    }
    return await this.wishRepository.delete(wishId);
  }

  async copyWish(wishId: number, user: User) {
    const wish = await this.findOne(wishId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (user.id !== wish.owner.id) {
      throw new ForbiddenException('Невозможно копировать свой подарок');
    }
    await this.wishRepository.update(wishId, {
      copied: (wish.copied += 1),
    });
    await this.create(user, {
      ...wish,
      raised: 0,
    });
  }

  async getLastWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
    });
  }

  async getTopWishes(): Promise<Wish[]> {
    return await this.wishRepository.find({
      take: 20,
      order: { copied: 'DESC' },
    });
  }
}
