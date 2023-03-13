import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Order } from "../entities/orders.entity"
import { Store } from "../entities/stores.entity"
import { Customer } from '../entities/customers.entity';
import { OrderItem } from "../entities/order-item.entity"
import { Package } from '../entities/package.entity';
import { Booking } from '../entities/bookings.entity';
import { Transaction } from '../entities/transaction.entity';
import { AccountantReportsService } from './accountant/accountant.report.service';
import { AccountantReportsController } from './accountant/accountant.report.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReportsService } from './report.service';
import { ReportsController } from './report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Customer, Store, Package, Transaction, Booking])
    , CacheModule.register({
      ttl: 60 * 60 * 24
    })],
  providers: [AccountantReportsService, {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,
  },ReportsService],
  controllers: [AccountantReportsController,ReportsController],
})

export class ReportModule { }
