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
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() сreateWishDto: CreateWishDto) {
    return await this.wishesService.create(req.user, сreateWishDto);
  }

  @Get('last')
  async getLastWishes() {
    return await this.wishesService.getLastWishes();
  }

  @Get('top')
  async getTopWishes() {
    return await this.wishesService.getTopWishes();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.wishesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateOne(
    @Req() req,
    @Param('id') wishId: string,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return await this.wishesService.update(req.user.id, +wishId, updateWishDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req, @Param('id') wishId: string) {
    return await this.wishesService.remove(req.user.id, +wishId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/copy')
  async copyWish(@Req() req, @Param('id') wishId: string) {
    return await this.wishesService.copyWish(+wishId, req.user);
  }
}
