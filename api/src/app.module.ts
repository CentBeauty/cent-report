import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleV1 } from './v1/index.module';
import * as dotenv from 'dotenv';
import { User } from './v1/entities/users.entity';
import { Order } from './v1/entities/orders.entity';
import { Transaction } from './v1/entities/transaction.entity';
import { Store } from './v1/entities/stores.entity';
import { Customer } from './v1/entities/customers.entity';
import { OrderItem } from './v1/entities/order-item.entity';
import { Options } from './v1/entities/options.entity';
import { Activity } from './v1/entities/activity.entity';
import { Booking } from './v1/entities/bookings.entity';
import { Product } from './v1/entities/product.entity';
import { Category } from './v1/entities/category.entity';
import { Package } from './v1/entities/package.entity';
import { ProductMeta } from './v1/entities/product-meta.entity';
import { Note } from './v1/entities/notes.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      Transaction,
      Store,
      Customer,
      OrderItem,
      Package,
      Category,
      Product,
      Booking,
      Activity,
      Options,
      ProductMeta,
      Note,
    ]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ModuleV1,
  ],
  providers: [],
})
export class AppModule {}
