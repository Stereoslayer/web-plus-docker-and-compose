import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}
  @Get()
  async findAll() {
    return this.wishlistsService.findAll();
  }

  @Post()
  async create(@Req() req, @Body() createWishlistDto: CreateWishlistDto) {
    return await this.wishlistsService.create(req.user, createWishlistDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.wishlistsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Req() req,
    @Param('id') wishlistId: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return await this.wishlistsService.update(
      req.user,
      +wishlistId,
      updateWishlistDto,
    );
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id') id: string) {
    return await this.wishlistsService.remove(req.user.id, +id);
  }
}
