import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import { Offer } from '../offers/entities/offer.entity';
export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: `${process.env.POSTGRES_HOST}`,
  port: 5432,
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DB}`,
  entities: [Offer, User, Wish, Wishlist],
  synchronize: true,
};
