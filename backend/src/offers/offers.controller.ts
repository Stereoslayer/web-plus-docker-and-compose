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
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}
  @Post()
  async create(@Req() req, @Body() createOfferDto: CreateOfferDto) {
    return await this.offersService.create(req.user, createOfferDto);
  }
  @Get()
  async findAll() {
    return this.offersService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.offersService.findOne(+id);
  }
}
