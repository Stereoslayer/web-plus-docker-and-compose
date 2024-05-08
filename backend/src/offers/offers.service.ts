import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}
  async create(user: User, createOfferDto: CreateOfferDto) {
    const wish = await this.wishesService.findOne(createOfferDto.itemId);
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (user.id === wish.owner.id) {
      throw new ForbiddenException(
        'Невозможно внести средства на собственный подарок',
      );
    }
    const sum = Number(wish.raised) + Number(createOfferDto.amount);
    if (+sum > wish.price) {
      throw new ForbiddenException('Сумма взноса превышает требуемую сумму');
    }
    await this.wishesService.update(wish.owner.id, wish.id, { raised: +sum });
    return this.offerRepository.save({ ...createOfferDto, user, item: wish });
  }

  async findAll() {
    const offers = await this.offerRepository.find({
      relations: {
        item: true,
        user: true,
      },
    });
    if (offers.length === 0) {
      throw new NotFoundException('Заявки не найдены');
    }
    return offers;
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.find({
      relations: {
        user: true,
        item: true,
      },
      where: { id },
    });
    if (offer.length === 0) {
      throw new NotFoundException('Заявка не найдена');
    }
    return offer;
  }

  async remove(id: number) {
    await this.offerRepository.delete(id);
  }
}
