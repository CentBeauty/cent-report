import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/orders.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/users.entity';
import { Customer } from '../entities/customers.entity';
import { Store } from '../entities/stores.entity';
import { Package } from '../entities/package.entity';
import { Transaction } from '../entities/transaction.entity';
import { Booking } from '../entities/bookings.entity';
import { Category } from '../entities/category.entity';
import { ProductMeta } from '../entities/product-meta.entity';
import { Note } from '../entities/notes.entity';
import { ExportCustomerServiceController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Order,
        OrderItem,
        Product,
        User,
        Customer,
        Store,
        Package,
        Transaction,
        Booking,
        Category,
        ProductMeta,
        Note,
      ],
      process.env.DB_REPORT_CONNECT_NAME,
    ),
  ],
  controllers: [ExportCustomerServiceController],
  providers: [ExportService],
})
export class ExportModule {}
