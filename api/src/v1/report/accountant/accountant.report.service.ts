import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, Between, In, Raw, Not, LessThan } from 'typeorm';
import { User } from '../../entities/users.entity';
import { Order } from "../../entities/orders.entity"
import { Store } from "../../entities/stores.entity"
import { Customer } from '../../entities/customers.entity';
import { OrderItem } from "../../entities/order-item.entity"
import { Package } from '../../entities/package.entity';
import { Booking } from '../../entities/bookings.entity';
import { Transaction } from '../../entities/transaction.entity';
let _ = require('lodash');
import { startOfDay, endOfDay } from 'date-fns'
import async from "async"
import * as helper from '../../helpers/response'
import { LooseObject } from 'interfaces/looseObject.interface';
import { Like } from "typeorm";
import { AnnouncePackageStatus } from '../enums/announcePackage.enum';
import * as constant from '../constant';

import {
    paginate,
} from 'nestjs-typeorm-paginate';
import * as moment from 'moment';
import { SortByEnum } from '../enums/announcePackage.enum';
@Injectable()
export class AccountantReportsService {
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
    subtractMonths(date, months) {
        date.setMonth(date.getMonth() - months);
        return date;
    }
    async getReportOwed(query) {
        try {
            const { limit, page, mobile, orderId, date, sortBy } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }

            let queryOptions: LooseObject = {
                money_owed: Raw(alias => `${alias} > 0`),
            }

            if (mobile && mobile.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    customers: {
                        mobile: Like(`%${mobile}%`)
                    }
                }
            }

            if (orderId && orderId.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order_code: orderId
                }
            }

            if (date && date.length > 0) {
                const dateNow = new Date()
                const filterDate = this.subtractMonths(dateNow, date)
                const dataNow = moment(filterDate).format('YYYY-MM-DD');
                queryOptions = {
                    ...queryOptions,
                    order_at: Raw(alias => `${alias} >= "${dataNow}"`),
                }
            }
            const data = await paginate(this.orderRepository, options, {
                select: {
                    order_at: true,
                    order_code: true,
                    id: true,
                    description: true,
                    customers: {
                        mobile: true,
                        full_name: true,
                        email: true
                    },
                    total_price: true,
                    created_name: true,
                    money_owed: true
                },
                where: queryOptions,
                relations: {
                    customers: true
                },
                order: {
                    order_at: sortBy ? sortBy === "date_desc" ? "DESC" : "ASC" : "DESC"
                },
                cache: true,
            });
            let { items } = data
            let res: LooseObject = { ...data }
            if (items.length > 0) {
                let sumMoneyOwed = _.sumBy(items, function (o) { return o.money_owed })
                let sumMoney = _.sumBy(items, function (o) { return o.total_price })
                const itemsNew = items.map(x => {
                    return {
                        key: x.id,
                        ...x,
                        order: {
                            ...x
                        }
                    }
                })
                res = {
                    ...res,
                    sumMoneyOwed,
                    sumMoney,
                    items: itemsNew
                }
            }
            return helper.success(res)
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async AnnouncePackage(query) {
        try {
            const { limit, page, mobile, orderId, status, sortBy, start, end } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }

            let queryOptions: LooseObject = {
                product_name: Like("%BHVV%"),
                max_used: Raw(alias => `${alias} > 9999`),
                status: 1,
                parent_package: IsNull(),
                soft_delete: IsNull()
            }

            if (mobile && mobile.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    customer_mobile: Like(`%${mobile}%`)
                }
            }

            if (orderId && orderId.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order_code: orderId
                }
            }
            if (status && status.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    count_used: Raw(alias => `${alias} ${status === AnnouncePackageStatus.DANGER ? ">= 11" : "<11"}`)
                }
            }
            if (start && end && start.length > 0 && end.length > 0 && parseInt(start) <= parseInt(end)) {
                queryOptions = {
                    ...queryOptions,
                    count_used: Between(parseInt(start), parseInt(end))
                }
            }
            const data = await paginate(this.packageRepository, options, {
                select: {
                    customer_mobile: true,
                    id: true,
                    customer_name: true,
                    order_code: true,
                    package_code: true,
                    product_name: true,
                    max_used: true,
                    count_used: true
                },
                where: queryOptions,
                order: {
                    created_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                },
                cache: true,
            })

            const { items } = data
            const newItem = items.map((x, i) => {
                return {
                    key: `key-${i}`,
                    ...x,
                    package: {
                        name: x.product_name,
                        code: x.package_code
                    },
                    customer: {
                        name: x.customer_name,
                        phone: x.customer_mobile
                    }
                }
            })

            return helper.success({ ...data, items: newItem })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }

    async CustomerPackage(query) {
        try {
            const { limit, page, mobile, orderId, startDate, endDate, sortBy } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }

            let queryOptions: LooseObject = {
                status: 1,
                parent_package: IsNull(),
                soft_delete: IsNull()
            }

            if (mobile && mobile.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    customer_mobile: Like(`%${mobile}%`)
                }
            }

            if (orderId && orderId.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order_code: orderId
                }
            }

            if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
                const start = moment(new Date(startDate)).startOf("day").format("YYYY-MM-DD HH:mm:ss")
                const end = moment(new Date(endDate)).endOf("day").format("YYYY-MM-DD HH:mm:ss")
                queryOptions = {
                    ...queryOptions,
                    orderItems: {
                        order: {
                            order_at: Between(
                                new Date(start),
                                new Date(end)
                            )
                        },
                        price: Raw(alias => `${alias} > 0`),
                    }
                }
            }
            const data = await paginate(this.packageRepository, options, {
                select: {
                    id: true,
                    customer_mobile: true,
                    sale_card: true,
                    rule_price: true,
                    order_code: true,
                    max_used: true,
                    count_used: true,
                    created_at: true,
                    product_name: true,
                    orderItems: {
                        id: true,
                        order: {
                            id: true,
                            order_at: true
                        }
                    },
                },
                where: queryOptions,
                order: {
                    created_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                },
                relations: {
                    orderItems: {
                        order: true
                    },
                },
                cache: true,
            })

            const { items } = data

            const newItem = items.map(x => {
                let newObject: LooseObject = {
                    ...x,
                    key: x.id,
                    price: {
                        initial: x.sale_card,
                        sale: x.rule_price
                    },
                    receipt_per_count: x.max_used > 999 ? 0 : ((x.rule_price > 0 ? x.rule_price : x.sale_card) / x.max_used),

                }
                if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
                    newObject = {
                        ...newObject,
                        useInRangeDate: x.orderItems.length,
                        ReceiptInDate: x.max_used > 999 ? 0 : newObject.receipt_per_count * x.orderItems.length
                    }
                } else {
                    newObject = {
                        ...newObject,
                        useInRangeDate: newObject.count_used,
                        ReceiptInDate: newObject.receipt_per_count * newObject.count_used
                    }
                }
                return newObject
            })
            return helper.success({ ...data, items: newItem })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async activeCustomer(query) {
        try {
            const { limit, page, mobile, status } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }

            let queryOptions: LooseObject = {
                soft_delete: IsNull(),
                order: {
                    total_price: Raw(alias => `${alias} >0`)
                },
                mobile: Not(IsNull())

            }

            if (mobile && mobile.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    mobile: Like(`%${mobile}%`)
                }
            }

            const data = await paginate(this.customerRepository, options, {
                select: {
                    id: true,
                    full_name: true,
                    mobile: true,
                    order: {
                        id: true,
                        total_price: true,
                        money_owed: true
                    },
                    created_at: true
                },
                where: queryOptions,
                relations: {
                    order: true
                },
                order: {
                    created_at: "DESC"
                },
                cache: true,
            })


            const { items } = data

            let newItem = items.map(x => {
                let sumMoney = _.sumBy(x.order, function (o) { return (o.total_price - o.money_owed) })
                let sumMoney2 = _.sumBy(x.order, function (o) { return o.total_price })
                return {
                    ...x,
                    key: x.id,
                    billNumber: x.order.length,
                    sumMoney,
                    sumPerBills: sumMoney2 / x.order.length || 0,
                    customer: {
                        name: x.full_name,
                        phone: x.mobile
                    },
                    isOld: x.order.length > 1 ? true : false
                }
            })

            return helper.success({ ...data, items: newItem })
            // return helper.success(data)
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async discount(query) {
        try {
            const { limit, page, sortBy, orderId, mobile, startDate, endDate } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }
            let queryOptions: LooseObject = {
                order: {
                    soft_delete: IsNull(),
                    status: 3,
                }
            }
            if (mobile && mobile.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order: {
                        customer: {
                            mobile: Like(`%${mobile}%`)
                        }
                    }
                }
            }
            if (orderId && orderId.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order: {
                        order_code: orderId
                    }
                }
            }
            if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
                const start = moment(new Date(startDate)).startOf("day").format("YYYY-MM-DD HH:mm:ss")
                const end = moment(new Date(endDate)).endOf("day").format("YYYY-MM-DD HH:mm:ss")
                queryOptions = {
                    ...queryOptions,
                    order: {
                        order_at: Between(
                            new Date(start),
                            new Date(end)
                        )
                    }
                }
            }
            const data = await paginate(this.orderItemRepository, options, {
                select: {
                    id: true,
                    order: {
                        id: true,
                        order_at: true,
                        order_code: true,
                        created_name: true,
                        sale_rule_applied_ids: true,
                        source_from: true,
                        customer: {
                            id: true,
                            full_name: true
                        },
                        staff_booking: true
                    },
                    price: true,
                    discount: true,
                    product_name: true
                },
                where: queryOptions,
                relations: {
                    order: {
                        customer: true
                    }
                },
                order: {
                    order: {
                        order_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                    }
                },
                cache: true,
            })
            let { items } = data
            let itemsNew = items.map(x => {
                const newObject = {
                    key: x.id,
                    ...x,
                    ...x.order
                }
                delete newObject.order
                return newObject
            })
            return helper.success({ ...data, items: itemsNew })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async collection(query) {
        try {
            const { limit, page, sortBy, orderId, mobile, startDate, endDate } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }
            let queryOptions: LooseObject = {
                order: {
                    soft_delete: IsNull(),
                    status: 3,
                    total_price: Raw(alias => `${alias} >0`)
                }
            }

            if (mobile && mobile.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order: {
                        ...queryOptions.order,
                        customer: {
                            mobile: Like(`%${mobile}%`)
                        }
                    }
                }
            }
            if (orderId && orderId.length > 0) {
                queryOptions = {
                    ...queryOptions,
                    order: {
                        ...queryOptions.order,
                        order_code: orderId
                    }
                }
            }
            if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
                const start = moment(new Date(startDate)).startOf("day").format("YYYY-MM-DD HH:mm:ss")
                const end = moment(new Date(endDate)).endOf("day").format("YYYY-MM-DD HH:mm:ss")
                queryOptions = {
                    ...queryOptions,
                    order: {
                        ...queryOptions.order,
                        order_at: Between(
                            new Date(start),
                            new Date(end)
                        )
                    }
                }
            }
            const data = await paginate(this.orderItemRepository, options, {
                select: {
                    id: true,
                    order: {
                        id: true,
                        order_at: true,
                        order_code: true,
                        created_name: true,
                        source_from: true,
                        payment_type: true,
                        customer: {
                            id: true,
                            full_name: true
                        },
                        discount_by_total_bill: true
                    },
                    employee_service_name1: true,
                    price: true,
                    discount: true,
                    product_name: true
                },
                where: queryOptions,
                relations: {
                    order: {
                        customer: true
                    },
                },
                order: {
                    order: {
                        order_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                    }
                },
                cache: true,
            })
            let { items } = data
            let itemsNew = items.map(x => {
                const newObject = {
                    ...x,
                    key: x.id,
                    ...x.order,
                    priceFinal: x.price - x.discount
                }
                delete newObject.order
                return newObject
            })
            return helper.success({ ...data, items: itemsNew })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async countServicesKtv(query) {
        try {
            const { limit, page, sortBy, startDate, endDate } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }
            let queryOptions: LooseObject = {
                order: {
                    soft_delete: IsNull(),
                    status: 3
                },
                employee_service1: Not(IsNull())
            }
            if (startDate && startDate.length > 0 && endDate && endDate.length > 0) {
                const start = moment(new Date(startDate)).startOf("day").format("YYYY-MM-DD HH:mm:ss")
                const end = moment(new Date(endDate)).endOf("day").format("YYYY-MM-DD HH:mm:ss")
                queryOptions = {
                    ...queryOptions,
                    order: {
                        order_at: Between(
                            new Date(start),
                            new Date(end)
                        )
                    },
                }
            }
            const data = await paginate(this.orderItemRepository, options, {
                where: queryOptions,
                select: {
                    id: true,
                    product_name: true,
                    employee_service1: true,
                    employee_service2: true,
                    order: {
                        id: true,
                        order_at: true,
                        stores: {
                            id: true,
                            name_store: true
                        }
                    }
                },
                relations: {
                    order: {
                        stores: true
                    },
                },
                order: {
                    order: {
                        order_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                    }
                },
                cache: true,
            })
            let { items } = data

            const { em1, em2 } = await async.parallel({
                em1: (cb) => {
                    const filter = items.filter(x => x.employee_service1 != null).map(x => {
                        return {
                            ...x,
                            key: x.id,
                            name: x.employee_service1
                        }
                    })
                    cb(null, filter)
                },
                em2: (cb) => {
                    const filter = items.filter(x => x.employee_service2 != null).map(x => {
                        return {
                            ...x,
                            key: x.id,
                            name: x.employee_service2
                        }
                    })
                    cb(null, filter)
                }
            })
            return helper.success({ ...data, items: [...em1, ...em2] })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async packageNotUse(query) {
        try {
            const { limit, page, sortBy } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }
            const data = await paginate(this.packageRepository, options, {
                select: {
                    id: true,
                    count_used: true,
                    sale_card: true,
                    product_name: true,
                    status: true,
                    parent_package: true,
                    soft_delete: true,
                    order_code: true,
                    created_at: true,
                    rule_price: true,
                    customer_name: true,
                    max_used: true,
                    orderItems: {
                        id: true,
                        order: {
                            id: true,
                            order_at: true,
                            sale_rule_applied_ids: true,
                            source_from: true,
                            created_name: true
                        },
                    }
                },
                where: {
                    status: 1,
                    parent_package: IsNull(),
                    soft_delete: IsNull()
                },
                relations: {
                    orderItems: {
                        order: true
                    }
                },
                order: {
                    orderItems: {
                        order: {
                            order_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                        }
                    }
                },
                cache: true,
            })
            let { items } = data
            const newItems = items.map(x => {
                const y: LooseObject = {
                    ...x,
                    order: {
                        ...x.orderItems[0].order
                    },
                    order_at: x.orderItems[0].order.order_at,
                    source_from: x.orderItems[0].order.source_from,
                    created_name: x.orderItems[0].order.created_name,
                    priceFinal: x.rule_price > 0 ? x.rule_price || 0 : x.sale_card || 0,
                    discount: x.rule_price > 0 ? (x.sale_card - x.rule_price) || 0 : 0,
                    priceRemain: ((x.rule_price > 0 ? x.rule_price : x.sale_card) / (x.max_used > 9999 ? 16 : x.max_used)) * ((x.max_used > 9999 ? 16 : x.max_used) - x.count_used)
                }
                delete y.orderItems
                return y
            })
            return helper.success({ ...data, items: newItems })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async customerPaid(query) {
        try {
            const { limit, page, sortBy, startDate, endDate } = query

            const options = {
                limit: parseInt(limit) || 20,
                page: parseInt(page) || 1
            }
            let queryOptions: LooseObject = {
                money_owed: Raw(alias => `${alias} > 0`),
            }
            const data = await paginate(this.orderRepository, options, {
                select: {
                    id: true,
                    order_at: true,
                    money_owed: true,
                    order_code: true,
                    source_from: true,
                    created_name: true,
                    total_price: true,
                    orderItem: {
                        id: true,
                        product_name: true
                    },
                    transaction: {
                        id: true,
                        paid_amount: true,
                        total_amount: true,
                        remain_amount: true,
                        created_at: true
                    },
                    customer: {
                        id: true,
                        full_name: true
                    }
                },
                where: queryOptions,
                relations: {
                    transaction: true,
                    orderItem: true,
                    customer: true
                },
                order: {
                    order_at: (sortBy && sortBy.length > 0) ? sortBy === SortByEnum.DATE_ASC ? "ASC" : "DESC" : "DESC"
                },
                cache: true
            })
            let { items } = data

            const newItems = items.map(x => {
                const compareDate = moment(new Date(x.order_at), "YYYY-MM-DD HH:mm:ss");
                const s = moment(new Date(startDate)).startOf("day").format("YYYY-MM-DD HH:mm:ss")
                const e = moment(new Date(endDate)).endOf("day").format("YYYY-MM-DD HH:mm:ss")
                const filter = x.transaction.filter(y => {
                    const compareDateTransaction = moment(new Date(y.created_at), "YYYY-MM-DD HH:mm:ss");
                    return compareDateTransaction.isBetween(s, e)
                })
                return {
                    ...x,
                    owedStart: x.transaction.length > 0 ? x.transaction[0].remain_amount : 0,
                    totalInDate: _.sumBy(x.transaction, function (o) { return o.paid_amount }) || 0,
                    addMore: compareDate.isBetween(s, e) ? x.total_price : 0,
                    transaction: filter
                }
            })
            return helper.success({ ...data, items: newItems })
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async handleCustomerOldNew(customerIds, orderCodes) {
        var customerNews = []
        if (customerIds.length == 0) {
            return customerNews
        }

        var query = this.customerRepository.createQueryBuilder('customer')
            .where("customer.soft_delete IS NULL")
            .andWhere("customer.id IN (:...ids)", { ids: customerIds })
            .andWhere("order.soft_delete IS NULL")
            .andWhere('order.status = 3')
            .innerJoinAndSelect("customer.order", "order")

        var customers = await query.getMany()


        for (let item of customers) {
            var statusNew = false
            if (item.order) {
                var orderMinOrderAt = _.minBy(item.order, 'order_at')
                if (orderMinOrderAt && orderCodes.includes(orderMinOrderAt.order_code)) {
                    statusNew = true
                }
            }

            if (statusNew) {
                customerNews.push(item.id)
            }
        }


        return customerNews
    }

    async customers(query) {
        try {
            const { startDate, endDate } = query
            const { customers, total, packageCount } = await async.parallel({
                customers: (cb) => {
                    var customerQuery = this.customerRepository
                        .createQueryBuilder("customer")
                        .innerJoinAndSelect("customer.order", "order")
                        .where('order.soft_delete IS NULL')
                        .andWhere('order.status = 3')
                        .orderBy('order.order_at', 'DESC')
                    customerQuery.andWhere('order.order_at BETWEEN :start_at AND :end_at', { start_at: startOfDay(new Date(startDate)), end_at: endOfDay(new Date(endDate)) })
                    customerQuery.getMany().then(rs => {
                        var orderCodes = []
                        var customerId = []
                        for (let item of rs) {
                            var orderMinOrderAt = _.minBy(item.order, 'order_at')
                            customerId.push(item.id)
                            orderCodes.push(orderMinOrderAt.order_code)
                        }
                        const customerIds = _.uniq(customerId)
                        this.handleCustomerOldNew(customerIds, orderCodes).then(rs => {
                            cb(null, { customerIds, customerNewOlds: rs })
                        })
                    })
                },
                total: (cb) => {
                    this.customerRepository
                        .createQueryBuilder("customer")
                        .andWhere('customer.created_at <= :start_at', { start_at: endOfDay(new Date(endDate)) }).cache(true).getCount().then(rs => {
                            cb(null, rs)
                        })
                },
                packageCount: (cb) => {
                    const end = moment(new Date(endDate)).endOf("day").format("YYYY-MM-DD HH:mm:ss")
                    this.customerRepository.findAndCount({
                        select: {
                            id: true,
                            created_at: true,
                            soft_delete: true,
                            packages: {
                                id: true,
                                status: true
                            }
                        },
                        where: {
                            soft_delete: IsNull(),
                            created_at: LessThan(new Date(end)),
                            packages: {
                                status: 1
                            }
                        },
                        relations: {
                            packages: true
                        },
                        cache: true
                    }).then(rs => cb(null, rs[1]))
                }
            })



            const ob = {
                newCount: customers.customerNewOlds.length || 0,
                activeCount: (customers.customerIds.length - customers.customerNewOlds.length) | 0,
                total: total,
                oldCount: total - customers.customerNewOlds.length || 0,
                package: packageCount
            }

            return helper.success(ob)
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async packageReceipt(query) {
        const { startDate, endDate } = query
        try {
            const startOfMonth = moment(new Date(startDate)).format('YYYY-MM-DD HH:mm:ss');
            const now = moment(new Date(endDate)).endOf('day').format('YYYY-MM-DD HH:mm:ss');

            const data = await this.packageRepository.find({
                select: {
                    id: true,
                    sale_card: true,
                    rule_price: true,
                    created_at: true,
                    product: {
                        id: true,
                        category_id: true,
                        category: {
                            id: true,
                        }
                    }
                },
                where: {
                    product: {
                        category: {
                            id: In([2, 4, 5])
                        }
                    },
                    created_at: Between(
                        new Date(startOfMonth),
                        new Date(now)
                    )
                },
                relations: {
                    product: {
                        category: true
                    }
                }
            })
            const mapData = data.map(x => {
                return {
                    ...x,
                    cate: x.product.category_id
                }
            })

            const grouped = _.groupBy(mapData, (x) => x.cate);
            const res: LooseObject = {}
            for (const key of Object.keys(grouped)) {
                const total = _.sumBy(grouped[key], function (o) { return (o.rule_price > 0 ? o.rule_price : o.sale_card) })
                res[key] = total
            }
            return helper.success(res)
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async countPackage(query) {
        const { status } = query
        try {

            const data = await this.packageRepository
                .createQueryBuilder('package')
                .select("COUNT(package.id)", "amount")
                .where("package.status = :status", { status: parseInt(status) })
                .innerJoinAndSelect("package.product", "product")
                .groupBy("package.product_id").getRawMany()

            return helper.success(data)
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
    async packageCustomerYear(query) {
        try {
            const { year, product_name } = query

            const startDate = moment(new Date(`${year}-01-01`)).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const now = moment(new Date(`${year}-12-31`)).endOf('day').format('YYYY-MM-DD HH:mm:ss');

            let queryOptions: LooseObject = {
                price: 0,
                order: {
                    order_at: Between(
                        new Date(startDate),
                        new Date(now))
                },
            }
            if(product_name && product_name.length >0){
                queryOptions={
                    ...queryOptions,
                    product:{
                        product_name : Like(`%${product_name}%`)
                    }
                }
            }
            const data = await this.orderItemRepository.find({
                select: {
                    id: true,
                    price: true,
                    product: {
                        id: true,
                        product_name: true,
                    },
                    order: {
                        id: true,
                        customer: {
                            id: true
                        },
                        order_at: true
                    }
                },
                where: queryOptions,
                relations: {
                    product: true,
                    order: {
                        customer: true
                    },
                },
                cache: true
            })

            const mapData = data.map(x => {
                return {
                    id: x.id,
                    product_name: x.product?.product_name || "",
                    order_at: x.order.order_at,
                    customer: x.order?.customer?.id || ""
                }
            })

            let groupProduct = _.groupBy(mapData, (x) => {
                return x.product_name
            })

            Object.keys(groupProduct).forEach(function (key1, index1) {
                let groupByMonth = _.groupBy(groupProduct[key1], (x) => {
                    return moment(new Date(x.order_at)).format('MM');
                })
                Object.keys(groupByMonth).forEach(function (key2, index2) {
                    let groupByCustomer = _.groupBy(groupByMonth[key2], (y) => {
                        return y.customer
                    })
                    groupByMonth[key2] = Object.keys(groupByCustomer).length
                })
                groupProduct[key1] = groupByMonth
            });

            return helper.success(Object.entries(groupProduct))
        } catch (error) {
            console.error(error)
            return helper.error(error)
        }
    }
}
