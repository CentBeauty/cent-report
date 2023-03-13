import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, Between, In, Raw, Not, LessThan } from 'typeorm';
import { User } from '../entities/users.entity';
import { Order } from "../entities/orders.entity"
import { Store } from "../entities/stores.entity"
import { Customer } from '../entities/customers.entity';
import { OrderItem } from "../entities/order-item.entity"
import { Package } from '../entities/package.entity';
import { Booking } from '../entities/bookings.entity';
import { Transaction } from '../entities/transaction.entity';
let _ = require('lodash');
import { startOfDay, endOfDay } from 'date-fns'
import async from "async"
import * as helper from '../helpers/response'
import { LooseObject } from 'interfaces/looseObject.interface';
import { Like } from "typeorm";
import { AnnouncePackageStatus } from './enums/announcePackage.enum';
import * as constant from './constant';
import {
    paginate,
} from 'nestjs-typeorm-paginate';
import * as moment from 'moment';
import { SortByEnum } from './enums/announcePackage.enum';
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
            const startDateOfTheYear = `${year || 2023}-01-01 00:00:00`
            const endDateOfTheYear = `${year || 2023}-12-31 23:59:59`
            const {transaction,revenue} = await async.parallel({
                revenue: (cb1) => {
                    this.orderRepository.find({
                        select: {
                            id: true,
                            order_at: true,
                            total_price: true
                        },
                        where: {
                            total_price: Raw(alias => `${alias} > 0`),
                            order_at: Between(
                                new Date(startDateOfTheYear),
                                new Date(endDateOfTheYear)
                            )
                        }
                    }).then(rs => {
                        const res = []
                        const groupByQuarter = _.groupBy(rs, (x) => moment(new Date(x.order_at)).format("Q"));
                        for (const key of Object.keys(groupByQuarter)) {
                            const total = _.sumBy(groupByQuarter[key], function (o) { return o.total_price })
                            res.push({quarter: key,value:total,type:"Tổng doanh thu"})
                        }
                        cb1(null, res)
                    })
                },
                transaction: (cb1) => {
                    this.transactionRepository.find({
                        select: {
                            id: true,
                            created_at: true,
                            paid_amount: true
                        },
                        where: {
                            created_at: Between(
                                new Date(startDateOfTheYear),
                                new Date(endDateOfTheYear)
                            ),
                        }
                    }).then(rs => {
                        const res = []
                        const groupByQuarter = _.groupBy(rs, (x) => moment(new Date(x.created_at)).format("Q"));
                        for (const key of Object.keys(groupByQuarter)) {
                            const total = _.sumBy(groupByQuarter[key], function (o) { return o.paid_amount })
                            res.push({quarter: key,value:total,type:"Doanh thu thuần"})
                        }
                        cb1(null, res)
                    })
                }
            })
            return helper.success([...revenue,...transaction])
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
}