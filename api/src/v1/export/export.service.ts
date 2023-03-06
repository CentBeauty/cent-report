import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, Brackets } from 'typeorm';
import { format, startOfDay, endOfDay } from 'date-fns'
import { Order } from '../entities/orders.entity'
import * as helper from '../helpers/response';
import * as constant from './constants';
import { User } from '../entities/users.entity'
import { Store } from '../entities/stores.entity'
import { Customer } from '../entities/customers.entity';
import { OrderListParam } from './order.interface';
import { OrderItem } from '../entities/order-item.entity'
import { Package } from '../entities/package.entity'
import { Workbook } from 'exceljs'
import * as tmp from 'tmp'
import * as AWS from "aws-sdk";
import * as dotenv from 'dotenv';
dotenv.config();

// import * as AWS from "aws-sdk";


let _ = require('lodash');

@Injectable()
export class ExportService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,

        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,

        @InjectRepository(OrderItem)
        private readonly orderItemRepo: Repository<OrderItem>,
        @InjectRepository(Package)
        private readonly packageRepo: Repository<Package>,

    ) { }

    dataFile
    async exportCustomerService() {
        try {
            let newDate = new Date
            var start = new Date('2023-01-22')
            var end = new Date('2023-03-08')
            end.setDate(end.getDate() + 1);
            let dataOrderItem = await this.orderRepo.createQueryBuilder('order')
                .where("order.soft_delete IS NULL")
                .andWhere("order.status = 3")
                .andWhere("orderItem.product_name like :name",{ name:`%${"bhvv"}%` })
                .innerJoinAndSelect("order.customers", "customers")
                .leftJoinAndSelect("order.orderItem", "orderItem")
                // .andWhere(
                //     'order.order_at BETWEEN :start_at AND :end_at',
                //     { start_at: startOfDay(start), end_at: endOfDay(end) })
                // .orderBy('customers.id', 'DESC')
                // .orderBy('order.order_at', 'DESC')
                .getRawMany()

            var data = await this.exportDataOrderDetail(dataOrderItem)
           return data
           
        } catch (error) {
            console.error(error)
            return helper.error(error, "exprot.service")
        }
    }

    async exportDataOrderDetail(dataOrderItems) {
        var mapCustomerProducts = {}
        var row1 = constant.defaultExportOrderDetail

        for (let item of dataOrderItems) {
            var filter = false
            if (item.orderItem_product_name == 'Thẻ cọc') {
                continue
            }

            if (!item.orderItem_employee_service_name1
                && !item.orderItem_employee_service_name2
                && !item.orderItem_employee_service_name3
                && !item.orderItem_employee_service_name4
                && !item.orderItem_employee_service_name5
                ) {
                    filter = true
            }

            if (item.orderItem_price > 0 || item.new_package) {
                filter = false
            }
            
            if (filter) {
                continue
            }
            let orderAt = new Date(item.order_order_at)
            if (!item.customers_id || !item.orderItem_product_name) {
                continue
            }

            
            var yearOrderAt = new Date(item.order_order_at).getFullYear()
            var yearMonthOrderAt = new Date(item.order_order_at).getFullYear() + '-' + (new Date(item.order_order_at).getMonth() + 1)
            var yearMonthDayOrderAt = new Date(item.order_order_at).getFullYear() + '-' + (new Date(item.order_order_at).getMonth() + 1) + '-' +  orderAt.getDate()
            
            if (!row1[yearOrderAt] || typeof row1[yearOrderAt] == 'undefined') {
                row1[yearOrderAt] = yearOrderAt
            }

            if (!row1[yearMonthOrderAt] || typeof row1[yearMonthOrderAt] == 'undefined') {
                row1[yearMonthOrderAt] = yearMonthOrderAt
            }
            let newRow1 = {}
            Object.entries(row1).map(x => {
                newRow1[x[0]] = ''
            })


            var keyMap = item.customers_id + item.orderItem_product_name
            if (mapCustomerProducts[keyMap] && typeof mapCustomerProducts[keyMap] != 'undefined') {
                let itemRow = {...mapCustomerProducts[keyMap]}

                if (new Date(itemRow['order_first_at']) >= new Date(yearMonthDayOrderAt)) {
                    itemRow['order_first_at'] = yearMonthDayOrderAt
                }
                if (item.orderItem_price == 0 && item.orderItem_discount == 0) {
                    itemRow['quantity_using'] = String(Number(itemRow['quantity_using']) + item.orderItem_quantity)
                    itemRow['order_code_using'] = ',' + item.order_order_code
                    if (!itemRow[yearOrderAt]) {
                        itemRow[yearOrderAt] = '0'
                    }
                    itemRow[yearOrderAt] = String(Number(itemRow[yearOrderAt]) + Number(item.orderItem_quantity))
                    if (!itemRow[yearMonthOrderAt] || typeof itemRow[yearMonthOrderAt] == 'undefined') {
                        itemRow[yearMonthOrderAt] = yearMonthDayOrderAt
                    } else {
                        itemRow[yearMonthOrderAt] += ',' + yearMonthDayOrderAt
                    }
                    
                }

                if (item.orderItem_price > 0 || item.new_package) {
                    itemRow['total_price'] = String(Number(itemRow['total_price']) + item.orderItem_price * item.orderItem_quantity - item.orderItem_discount)
                    itemRow['quantity'] = String(Number(itemRow['quantity']) + Number(item.orderItem_quantity))
                    itemRow['by_date'] = yearMonthDayOrderAt
                    itemRow['order_code'] += ',' + item.order_order_code

                    if (!itemRow[yearOrderAt] || typeof itemRow[yearOrderAt] == 'undefined') {
                        itemRow[yearOrderAt] = String(item.orderItem_quantity)
                    } else {
                        if (!itemRow[yearOrderAt]) {
                            itemRow[yearOrderAt] = '0'
                        }
                        itemRow[yearOrderAt] = String(Number(itemRow[yearOrderAt]) + Number(item.orderItem_quantity))
                    }
                }
                
                mapCustomerProducts[keyMap] = itemRow
            } else {
                var itemRow = {...newRow1}
                let timeMonthOrderAt = ''
                let byDate = ''
                let quantity_using = 0
                let quantity = 0
                if (item.orderItem_price == 0 && item.orderItem_discount == 0) {
                    timeMonthOrderAt = yearMonthDayOrderAt
                    quantity_using += item.orderItem_quantity
                    itemRow['order_code_using'] = item.order_order_code
                }
                if (item.orderItem_price > 0) {
                    byDate = yearMonthDayOrderAt
                    quantity += item.orderItem_quantity 
                    itemRow['order_code'] = item.order_order_code
                }
                
            
                itemRow['customer_name'] = item.customers_full_name
                itemRow['customer_mobile'] = item.customers_mobile
                itemRow['product_name'] = item.orderItem_product_name
                itemRow['order_first_at'] = yearMonthDayOrderAt
                itemRow['by_date'] = byDate
                itemRow['quantity'] = String(quantity)
                itemRow['quantity_using'] = String(quantity_using)
                itemRow['total_price'] = String(item.orderItem_price * quantity  - item.orderItem_discount)
                itemRow[yearOrderAt] = String(item.orderItem_quantity)
                itemRow[yearMonthOrderAt] = timeMonthOrderAt
                
                mapCustomerProducts[keyMap] = itemRow
            }
        }

        let rows = []
        rows.push(Object.values(row1))
        let newRow1 = {}
        Object.entries(row1).map(x => {
            newRow1[x[0]] = ''
        })

        Object.entries(mapCustomerProducts).map(x => {
            let newRow = {...newRow1,...Object(x[1])}
            rows.push(Object.values(newRow))
        })
        mapCustomerProducts = {}
       
        var urlS3 = await this.uploadFile(rows, "chi_tiet_khach_hang_su_dung_dich_vu_bhvv")
        return urlS3
    }


    async uploadFile(row, name) {
        var fs = require('fs');
        var dir = './public';
        var date = new Date().getTime()

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let book = new Workbook();
        var sheet = book.addWorksheet('sheet1')
        sheet.addRows(row)
        var fileName = name + date + ".xlsx"
        var file = dir + "/" + fileName

        await book.xlsx.writeFile(file)
        var urlS3 = await this.uploadFileS3(file, fileName)
        if (urlS3) {
            const fs = require('fs')
            if (fs.existsSync(file)) {
                fs.unlinkSync(file)
            }

        }
        return urlS3
    }

    async uploadFileS3(file, name) {
        try {
            var fs = require('fs');
            var urlS3 = ""
            let s3 = new AWS.S3
                ({
                    accessKeyId: process.env.REACT_APP_CCCESS_KEY_ID,
                    secretAccessKey:  process.env.REACT_APP_SECRET_ACCESS_KEY,
                    region: 'hn',
                    endpoint: process.env.REACT_APP_ENDPOINT,
                });

            
            await fs.readFile(file, (err, data) => {
                if (err) throw err;
                this.dataFile = data
                const params = 
                {
                    Bucket: "cent-beauty",
                    Key: String(name),
                    Body: data,
                    ACL: "public-read" 
                };
                s3.upload(params, function(s3Err, data) {
                    if (s3Err) throw s3Err
                });
             });
             await new Promise(r => setTimeout(r, 1500));
                var urlS3 = process.env.REACT_APP_S3_URL + name
            return urlS3
        } catch (e) {
            console.log(e)
            return false
        }

    }

    async processFile(content) {
        console.log(content);
    }

    async exportPackageDetail() { 
        var start = new Date('2022-10-01')
        var end = new Date('2022-12-24')
        end.setDate(end.getDate() + 1);
        var orderItems = await this.orderItemRepo.createQueryBuilder('order_item')
            .where('order.soft_delete IS NULL')
            .andWhere('order.status = 3')
            // .andWhere('order.money_owed > 0')
            .leftJoinAndSelect("order_item.order", "order")
            .andWhere(
                    'order.order_at BETWEEN :start_at AND :end_at',
                    { start_at: startOfDay(start), end_at: endOfDay(end) })
            .getRawMany()


        var orderCodes = []
        var dataOrderItemNew = {}
        for(let item of orderItems) {
            if (item.order_item_package_code) {
                orderCodes.push(item.order_order_code)
                dataOrderItemNew[item.order_order_code] = item
            }
        }

        // return dataOrderItemNew
        var packages = await this.packageRepo.createQueryBuilder('package')
            .where("package.soft_delete IS NULL")
            .andWhere('package.order_code IN (:...order_code)', {order_code: orderCodes})
            .andWhere("package.status = 1")
            .andWhere('customer.soft_delete IS NULL')
            .leftJoinAndSelect('package.customer', 'customer')
            .orderBy('customer.id', 'DESC')
            .getRawMany()
        
        var rowPackage = {}
        var i = 1
        var packageCodes = []
        for(let item of packages) {
            let defaultRow = {...constant.exportPackageDetail}
            defaultRow.stt = String(i)
            defaultRow.customer_name = item.customer_full_name
            defaultRow.customer_mobile = item.customer_mobile ? item.customer_mobile : item.package_customer_mobile
            defaultRow.package_date = item.package_created_at
            defaultRow.package_code =  item.package_package_code
            defaultRow.package_name = item.package_product_name
            defaultRow.order_code = item.package_order_code
            defaultRow.total_bill = String(dataOrderItemNew[item.package_order_code].order_total_price)
            defaultRow.paid_mony = String(dataOrderItemNew[item.package_order_code].order_total_price - dataOrderItemNew[item.package_order_code].order_money_owed)
            defaultRow.owed_mony = String(Number(dataOrderItemNew[item.package_order_code].order_money_owed)),
            defaultRow.max_use = item.package_max_used > 100 ? "Vĩnh viễn" : String(item.package_max_used)
            defaultRow.use_mony = ' '
            defaultRow.count_use = String(item.package_count_used)
            defaultRow.residual_use = item.package_max_used > 100 ? "Vĩnh viễn" : String(item.package_max_used - item.package_count_used)
            rowPackage[item.package_package_code] = defaultRow
            i ++
            packageCodes.push(item.package_package_code)
        }

        var orderItemFindPackage = await this.orderItemRepo.createQueryBuilder('order_item')
            .where('order.soft_delete IS NULL')
            .andWhere('order.status = 3')
            .andWhere('order_item.package_code IN (:...package_code)', {package_code: packageCodes})
            .leftJoinAndSelect("order_item.order", "order")
            .getRawMany()

        var countUsing = {}

        var rowOne = {...constant.exportPackageDetail}
        for(let item of orderItemFindPackage) {
            if(rowPackage[item.order_item_package_code] && typeof rowPackage[item.order_item_package_code] != "undefined") {
                if (item.order_item_package_code && item.order_item_price == 0 && !item.order_item_new_package) {

                    if (typeof countUsing[item.order_item_package_code] == "undefined") {
                        countUsing[item.order_item_package_code] = 1
                    } else {
                        countUsing[item.order_item_package_code] += 1
                    }
                    var dateUsing = "Dùng lần " + countUsing[item.order_item_package_code]
                    rowOne[dateUsing] = dateUsing
                    rowPackage[item.order_item_package_code][dateUsing] = item.order_order_at

                    // console.log(item.order_order_code, item.order_order_at, 2)
                }
                
            }
        }

        var rowPackageCheck = {}
    
        let rows = []
        rows.push(Object.values(rowOne))
        let newRow1 = {}
        Object.entries(rowOne).map(x => {
            newRow1[x[0]] = ''
        })

        Object.entries(rowPackage).map(x => {
            console.log(x[1]['count_use'], countUsing[x[0]])
            if (typeof countUsing[x[0]] != "undefined" && x[1]['count_use'] != countUsing[x[0]]) {
                let newRow = {...newRow1,...Object(x[1])}
                rows.push(Object.values(newRow))
            }
        })
        
        var urlS3 = await this.uploadFile(rows, "khach_hang_su_dung_the_xai_het_tien")
        return urlS3
    }
}