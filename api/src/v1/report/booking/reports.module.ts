import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../entities/bookings.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
    ]),
    CacheModule.register({
      ttl: 60 * 60 * 24,
    }),
  ],
  providers: [
    BookingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  controllers: [BookingController],
})
export class BookingModule { }
