import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { BookingService } from './booking.service';
@Controller('booking')
@UseInterceptors(CacheInterceptor)
export class BookingController {
  constructor(private readonly BookingService: BookingService) {}
  @Get('/table')
  async bookings(@Query() query) {
    return await this.BookingService.bookingTable(query)
  }
  @Get('/chart')
  async bookingDashType(@Query() query) {
    return await this.BookingService.bookingDash(query)
  }
}
