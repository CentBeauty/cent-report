import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/users.entity';
import { Order } from "../entities/orders.entity"
import { Store } from "../entities/stores.entity"
import { Customer } from '../entities/customers.entity';
import { OrderItem } from "../entities/order-item.entity"
import { Package } from '../entities/package.entity';
import { Booking } from '../entities/bookings.entity';
import { Transaction } from '../entities/transaction.entity';
import { ConfigService, ConfigModule } from "@nestjs/config" 
import { AccountantReportsService } from './accountant/accountant.report.service';
import { AccountantReportsController } from './accountant/accountant.report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Customer, Store, Package, Transaction, Booking])
  ],
  providers: [AccountantReportsService],
  controllers: [AccountantReportsController],
})

export class ReportModule { }
