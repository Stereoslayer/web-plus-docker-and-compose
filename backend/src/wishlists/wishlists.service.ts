import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}
  async create(user: User, createWishlistDto: CreateWishlistDto) {
    const { itemsId } = createWishlistDto;
    const wishes = itemsId.map((id) => {
      return this.wishesService.findOne(id);
    });
    return await Promise.all(wishes).then((items) => {
      const wishlist = this.wishlistsRepository.create({
        ...createWishlistDto,
        owner: user,
        items,
      });
      return this.wishlistsRepository.save(wishlist);
    });
  }

  async findAll() {
    return await this.wishlistsRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async findOne(id: number) {
    return await this.wishlistsRepository.findOne({
      relations: ['owner', 'items'],
      where: { id },
    });
  }

  async update(user: User, id: number, updateWishlistDto: UpdateWishlistDto) {
    const wishlist = await this.findOne(id);
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    if (user.id !== wishlist.owner.id) {
      throw new ForbiddenException('Невозможно редактировать чужой список');
    }
    const wishes = await this.wishesService.findMany(updateWishlistDto.itemsId);
    return await this.wishlistsRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      image: updateWishlistDto.image,
      items: wishes,
      description: updateWishlistDto.description,
    });
  }

  async remove(userId: number, wishListId: number) {
    const wishlist = await this.findOne(wishListId);
    if (!wishlist) {
      throw new NotFoundException('Список не найден');
    }
    if (userId !== wishlist.owner.id) {
      throw new ForbiddenException('Невозможно удалить чужой список');
    }
    await this.wishlistsRepository.delete(wishListId);
    return wishlist;
  }
}
