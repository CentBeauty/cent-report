import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, Between, In, Raw, Not, LessThan } from 'typeorm';
import { User } from '../entities/users.entity';
import { Order } from '../entities/orders.entity';
import { Store } from '../entities/stores.entity';
import { Customer } from '../entities/customers.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Package } from '../entities/package.entity';
import { Booking } from '../entities/bookings.entity';
import { Transaction } from '../entities/transaction.entity';
const _ = require('lodash');
import { startOfDay, endOfDay } from 'date-fns';
import async from 'async';
import * as helper from '../helpers/response';
import { LooseObject } from 'interfaces/looseObject.interface';
import { Like } from 'typeorm';
import { AnnouncePackageStatus } from './enums/announcePackage.enum';
import * as constant from './constant';
import { paginate } from 'nestjs-typeorm-paginate';
import * as moment from 'moment';
import { SortByEnum } from './enums/announcePackage.enum';
import { optionsSourceBooking } from '../enums/booking.type';
import { bookingStatus } from '../enums/booking.status';
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) { }
  async dashboard(year) {
    try {
      const startDateOfTheYear = `${year || 2023}-01-01 00:00:00`;
      const endDateOfTheYear = `${year || 2023}-12-31 23:59:59`;
      const { transaction, revenue } = await async.parallel({
        revenue: (cb) => {
          this.orderRepository
            .find({
              select: {
                id: true,
                order_at: true,
                total_price: true,
              },
              where: {
                total_price: Raw((alias) => `${alias} > 0`),
                order_at: Between(
                  new Date(startDateOfTheYear),
                  new Date(endDateOfTheYear),
                ),
              },
            })
            .then((rs) => {
              const res = [];
              const groupByQuarter = _.groupBy(rs, (x) =>
                moment(new Date(x.order_at)).format('Q'),
              );
              for (const key of Object.keys(groupByQuarter)) {
                const total = _.sumBy(groupByQuarter[key], function (o) {
                  return o.total_price;
                });
                res.push({
                  quarter: key,
                  value: total,
                  type: 'Tổng doanh thu',
                });
              }
              cb(null, res);
            });
        },
        transaction: (cb) => {
          this.transactionRepository
            .find({
              select: {
                id: true,
                created_at: true,
                paid_amount: true,
              },
              where: {
                created_at: Between(
                  new Date(startDateOfTheYear),
                  new Date(endDateOfTheYear),
                ),
              },
            })
            .then((rs) => {
              const res = [];
              const groupByQuarter = _.groupBy(rs, (x) =>
                moment(new Date(x.created_at)).format('Q'),
              );
              for (const key of Object.keys(groupByQuarter)) {
                const total = _.sumBy(groupByQuarter[key], function (o) {
                  return o.paid_amount;
                });
                res.push({
                  quarter: key,
                  value: total,
                  type: 'Doanh thu thuần',
                });
              }
              cb(null, res);
            });
        },
      });
      return helper.success([...revenue, ...transaction]);
    } catch (error) {
      console.error(error);
      return helper.error(error);
    }
  }
  async headerDash() {
    try {
      return async
        .parallel({
          expectRevenue: (cb) => {
            this.bookingRepository
              .createQueryBuilder('booking')
              .select('booking.booking_item')
              .addSelect('booking.created_at')
              .addSelect('booking.store_id')
              .where('booking.store_id != :id', { id: 8 })
              .andWhere('booking.book_date BETWEEN :start_at AND :end_at', {
                start_at: startOfDay(new Date()),
                end_at: endOfDay(new Date()),
              })
              .andWhere('booking.book_status NOT IN (:...status)', {
                status: [5, 6, 7],
              })
              .leftJoinAndSelect('booking.stores', 'store')
              .getRawMany()
              .then((rs) => {
                let total = 0;
                rs.forEach((x) => {
                  x.booking_booking_item.forEach((y) => {
                    const t = _.sumBy(y.product_ids, function (o) {
                      return o.price || 0;
                    });
                    total += t || 0;
                  });
                });
                cb(null, total);
              });
          },
          payByCash: (cb) => {
            this.transactionRepository
              .createQueryBuilder('transaction')
              .where('transaction.pay_type = :pay_type', {
                pay_type: 'Tiền mặt',
              })
              .andWhere('order.order_at BETWEEN :start_at AND :end_at', {
                start_at: startOfDay(new Date()),
                end_at: endOfDay(new Date()),
              })
              .andWhere('transaction.status = :status', { status: 1 })
              .andWhere('transaction.soft_delete IS NULL')
              .andWhere('order.status = 3')
              .andWhere('order.store_id != :id', { id: 8 })
              .leftJoinAndSelect('transaction.order', 'order')
              .leftJoinAndSelect('order.stores', 'store')
              .getRawMany()
              .then((rs) => {
                const total = _.sumBy(rs, function (o) {
                  return o.transaction_paid_amount || 0;
                });
                cb(null, total);
              });
          },
          paySwipe: (cb) => {
            this.transactionRepository
              .createQueryBuilder('transaction')
              .where('transaction.pay_type IN (:...pay_types)', {
                pay_types: ['Quẹt thẻ', 'Chuyển khoản'],
              })
              .andWhere('transaction.soft_delete IS NULL')
              .andWhere('order.order_at BETWEEN :start_at AND :end_at', {
                start_at: startOfDay(new Date()),
                end_at: endOfDay(new Date()),
              })
              .andWhere('transaction.status = :status', { status: 1 })
              .andWhere('order.status = 3')
              .andWhere('order.store_id != :id', { id: 8 })
              .leftJoinAndSelect('transaction.order', 'order')
              .leftJoinAndSelect('order.stores', 'store')
              .getRawMany()
              .then((rs) => {
                const total = _.sumBy(rs, function (o) {
                  return o.transaction_paid_amount || 0;
                });
                cb(null, total);
              });
          },
          receipt: (cb) => {
            this.transactionRepository
              .createQueryBuilder('transaction')
              .andWhere('transaction.soft_delete IS NULL')
              .andWhere('order.order_at BETWEEN :start_at AND :end_at', {
                start_at: startOfDay(new Date()),
                end_at: endOfDay(new Date()),
              })
              .andWhere('transaction.status = :status', { status: 1 })
              .andWhere('order.status = 3')
              .andWhere('order.store_id != :id', { id: 8 })
              .leftJoinAndSelect('transaction.order', 'order')
              .leftJoinAndSelect('order.stores', 'store')
              .getRawMany()
              .then((rs) => {
                const total = _.sumBy(rs, function (o) {
                  return o.transaction_paid_amount || 0;
                });
                cb(null, total);
              });
          },
          owed: (cb) => {
            const query = this.transactionRepository
              .createQueryBuilder('transaction')
              .andWhere('transaction.status = :status', { status: 2 })
              .andWhere('transaction.soft_delete IS NULL')
              .andWhere('order.store_id != :id', { id: 8 })
              .andWhere(
                'transaction.created_at BETWEEN :start_at AND :end_at',
                {
                  start_at: startOfDay(new Date()),
                  end_at: endOfDay(new Date()),
                },
              )
              .leftJoinAndSelect('transaction.order', 'order')
              .leftJoinAndSelect('order.stores', 'store');
            query.getRawMany().then((rs) => {
              let total = 0;
              rs.forEach(function (x, index1) {
                const result = _.sumBy(x, function (o) {
                  return o.transaction_paid_amount || 0;
                });
                total += result || 0;
              });
              cb(null, total);
            });
          },
          bookings: (cb) => {
            this.bookingRepository
              .createQueryBuilder('booking')
              .select('booking.book_status')
              .addSelect('booking.store_id')
              .addSelect('booking.book_date')
              .where('booking.store_id != :id', { id: 8 })
              .andWhere('booking.book_date BETWEEN :start_at AND :end_at', {
                start_at: startOfDay(new Date()),
                end_at: endOfDay(new Date()),
              })
              .leftJoinAndSelect('booking.stores', 'store')
              .getRawMany()
              .then(async (rs) => {
                async
                  .parallel({
                    done: (cb) => {
                      const result = rs.filter(
                        (x) => x.booking_book_status == 7,
                      );
                      cb(null, result.length || 0);
                    },
                    cancel: (cb) => {
                      const result = rs.filter(
                        (x) => x.booking_book_status == 5,
                      );
                      cb(null, result.length || 0);
                    },
                    notCome: (cb) => {
                      const result = rs.filter(
                        (x) => x.booking_book_status == 6,
                      );
                      cb(null, result.length || 0);
                    },
                    total: (cb) => {
                      cb(null, rs.length || 0);
                    },
                  })
                  .then((r) => cb(null, r));
              });
          },
          orders: (cb) => {
            this.orderRepository
              .count({
                select: {
                  id: true,
                  order_at: true,
                },
                where: {
                  order_at: Between(
                    new Date(startOfDay(new Date())),
                    new Date(endOfDay(new Date())),
                  ),
                },
              })
              .then((rs) => cb(null, rs));
          },
          sumOwedToday: (cb) => {
            this.orderRepository
              .find({
                select: {
                  id: true,
                  money_owed: true,
                  order_at: true,
                },
                where: {
                  money_owed: Raw((alias) => `${alias} > 0`),
                  order_at: Between(
                    new Date(startOfDay(new Date())),
                    new Date(endOfDay(new Date())),
                  ),
                },
              })
              .then((rs) => {
                const result = _.sumBy(rs, function (o) {
                  return o.money_owed || 0;
                });
                cb(null, result);
              });
          },
          newCustomer: (cb) => {
            this.customerRepository
              .count({
                select: {
                  id: true,
                  created_at: true,
                },
                where: {
                  created_at: Between(
                    new Date(startOfDay(new Date())),
                    new Date(endOfDay(new Date())),
                  ),
                },
              })
              .then((rs) => cb(null, rs));
          },
        })
        .then((rs) => {
          return helper.success(rs);
        });
    } catch (error) {
      console.error(error);
      return helper.error(error);
    }
  }
  async bookingTable(query) {
    try {
      const { type, start, end, limit, page, sortBy, status } = query

      const options = {
        limit: parseInt(limit) || 20,
        page: parseInt(page) || 1,
      };

      let queryOptions: LooseObject = {}

      if (start && start.length > 0 && end && end.length > 0) {
        const startDay = moment(new Date(start)).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const endDay = moment(new Date(end)).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        queryOptions = {
          ...queryOptions,
          book_date: Between(new Date(startDay), new Date(endDay))
        }
      }

      if (type && parseInt(type) > 0) {
        queryOptions = {
          ...queryOptions,
          source_from: type
        }
      }

      if (status && parseInt(status) > 0) {
        queryOptions = {
          ...queryOptions,
          book_status: status
        }
      }
      const data = await paginate(this.bookingRepository, options, {
        select: {
          id: true,
          book_code: true,
          book_status: true,
          book_date: true,
          created_at: true,
          source_from: true,
          booking_item: true,
          description: true,
          customers: {
            id: true,
            mobile: true,
            full_name: true
          },
          stores: {
            id: true,
            name_store: true
          }
        },
        where: queryOptions,
        relations: {
          customers: true,
          stores: true,
        },
        order: {
          created_at: (sortBy && sortBy.length > 0) ? sortBy : "DESC"
        }
      })

      return helper.success(data)
    } catch (error) {
      console.error(error)
      return helper.error(error)
    }
  }
  async bookingDashType(query) {
    try {
      const { start, end } = query

      const startDay = moment(new Date(start || new Date())).startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const endDay = moment(new Date(end || new Date())).endOf('day').format('YYYY-MM-DD HH:mm:ss');

      const data = await this.bookingRepository.find({
        select: {
          id: true,
          source_from: true,
          status:true
        },
        where: {
          book_date: Between(new Date(startDay), new Date(endDay))
        }
      })

      const grouped = _.groupBy(data, (x) => x.source_from)
      const groupedStatus = _.groupBy(data, (x) => x.status)
      let rsType = []
      let rsStatus = []
      for (const property in grouped) {
        const ob = {
          type: optionsSourceBooking[property],
          number: grouped[property].length
        }
        rsType.push(ob)
      }
      for (const property in groupedStatus) {
        const ob = {
          status: bookingStatus[property],
          number: groupedStatus[property].length
        }
        rsStatus.push(ob)
      }

      return helper.success({type:rsType,status:rsStatus})
    } catch (error) {
      console.log(error)
      return helper.error(error)
    }
  }
}
