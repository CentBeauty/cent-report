import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, Brackets, Between } from 'typeorm';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Order } from '../entities/orders.entity';
import * as helper from '../helpers/response';
import * as constant from './constants';
import { User } from '../entities/users.entity';
import { Store } from '../entities/stores.entity';
import { Customer } from '../entities/customers.entity';
import { OrderListParam } from './order.interface';
import { OrderItem } from '../entities/order-item.entity';
import { Package } from '../entities/package.entity';
import { Workbook } from 'exceljs';
import * as AWS from 'aws-sdk';
import * as moment from 'moment';
import * as dotenv from 'dotenv';
import { addRowSheet } from '../utils/connectGoogleSheet';

import { paginate } from 'nestjs-typeorm-paginate';
dotenv.config();

// import * as AWS from "aws-sdk";

const _ = require('lodash');

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
  ) {}

  dataFile;
  async exportCustomerService(query) {
    try {
      let { start, end } = query;
      start = new Date(`${start || 2022}-01-01`);
      end = new Date(`${end || 2023}-12-31`);
      end.setDate(end.getDate() + 1);
      const dataOrderItem = await this.orderRepo
        .createQueryBuilder('order')
        .where('order.soft_delete IS NULL')
        .andWhere('order.status = 3')
        .andWhere('orderItem.product_name like :name', { name: `%${'bhvv'}%` })
        .innerJoinAndSelect('order.customers', 'customers')
        .leftJoinAndSelect('order.orderItem', 'orderItem')
        .andWhere('order.order_at BETWEEN :start_at AND :end_at', {
          start_at: startOfDay(start),
          end_at: endOfDay(end),
        })
        .orderBy('customers.id', 'DESC')
        .orderBy('order.order_at', 'DESC')
        .getRawMany();

      const data = await this.exportDataOrderDetail(dataOrderItem);
      return data;
    } catch (error) {
      console.error(error);
      return helper.error(error, 'exprot.service');
    }
  }
  async exportDataOrderDetail(dataOrderItems) {
    let mapCustomerProducts = {};
    const row1 = constant.defaultExportOrderDetail;

    for (const item of dataOrderItems) {
      let filter = false;
      if (item.orderItem_product_name == 'Thẻ cọc') {
        continue;
      }

      if (
        !item.orderItem_employee_service_name1 &&
        !item.orderItem_employee_service_name2 &&
        !item.orderItem_employee_service_name3 &&
        !item.orderItem_employee_service_name4 &&
        !item.orderItem_employee_service_name5
      ) {
        filter = true;
      }

      if (item.orderItem_price > 0 || item.new_package) {
        filter = false;
      }

      if (filter) {
        continue;
      }
      const orderAt = new Date(item.order_order_at);
      if (!item.customers_id || !item.orderItem_product_name) {
        continue;
      }

      const yearOrderAt = new Date(item.order_order_at).getFullYear();
      const yearMonthOrderAt =
        new Date(item.order_order_at).getFullYear() +
        '-' +
        (new Date(item.order_order_at).getMonth() + 1);
      const yearMonthDayOrderAt =
        new Date(item.order_order_at).getFullYear() +
        '-' +
        (new Date(item.order_order_at).getMonth() + 1) +
        '-' +
        orderAt.getDate();

      if (!row1[yearOrderAt] || typeof row1[yearOrderAt] == 'undefined') {
        row1[yearOrderAt] = yearOrderAt;
      }

      if (
        !row1[yearMonthOrderAt] ||
        typeof row1[yearMonthOrderAt] == 'undefined'
      ) {
        row1[yearMonthOrderAt] = yearMonthOrderAt;
      }
      const newRow1 = {};
      Object.entries(row1).map((x) => {
        newRow1[x[0]] = '';
      });

      const keyMap = item.customers_id + item.orderItem_product_name;
      if (
        mapCustomerProducts[keyMap] &&
        typeof mapCustomerProducts[keyMap] != 'undefined'
      ) {
        const itemRow = { ...mapCustomerProducts[keyMap] };

        if (
          new Date(itemRow['order_first_at']) >= new Date(yearMonthDayOrderAt)
        ) {
          itemRow['order_first_at'] = yearMonthDayOrderAt;
        }
        if (item.orderItem_price == 0 && item.orderItem_discount == 0) {
          itemRow['quantity_using'] = String(
            Number(itemRow['quantity_using']) + item.orderItem_quantity,
          );
          itemRow['order_code_using'] = ',' + item.order_order_code;
          if (!itemRow[yearOrderAt]) {
            itemRow[yearOrderAt] = '0';
          }
          itemRow[yearOrderAt] = String(
            Number(itemRow[yearOrderAt]) + Number(item.orderItem_quantity),
          );
          if (
            !itemRow[yearMonthOrderAt] ||
            typeof itemRow[yearMonthOrderAt] == 'undefined'
          ) {
            itemRow[yearMonthOrderAt] = 1;
          } else {
            itemRow[yearMonthOrderAt] = itemRow[yearMonthOrderAt] + 1;
          }
        }

        if (item.orderItem_price > 0 || item.new_package) {
          itemRow['total_price'] = String(
            Number(itemRow['total_price']) +
              item.orderItem_price * item.orderItem_quantity -
              item.orderItem_discount,
          );
          itemRow['quantity'] = String(
            Number(itemRow['quantity']) + Number(item.orderItem_quantity),
          );
          itemRow['by_date'] = yearMonthDayOrderAt;
          itemRow['order_code'] += ',' + item.order_order_code;

          if (
            !itemRow[yearOrderAt] ||
            typeof itemRow[yearOrderAt] == 'undefined'
          ) {
            itemRow[yearOrderAt] = String(item.orderItem_quantity);
          } else {
            if (!itemRow[yearOrderAt]) {
              itemRow[yearOrderAt] = '0';
            }
            itemRow[yearOrderAt] = String(
              Number(itemRow[yearOrderAt]) + Number(item.orderItem_quantity),
            );
          }
        }

        mapCustomerProducts[keyMap] = itemRow;
      } else {
        const itemRow = { ...newRow1 };
        let timeMonthOrderAt = '';
        let byDate = '';
        let quantity_using = 0;
        let quantity = 0;
        if (item.orderItem_price == 0 && item.orderItem_discount == 0) {
          timeMonthOrderAt = yearMonthDayOrderAt;
          quantity_using += item.orderItem_quantity;
          itemRow['order_code_using'] = item.order_order_code;
        }
        if (item.orderItem_price > 0) {
          byDate = yearMonthDayOrderAt;
          quantity += item.orderItem_quantity;
          itemRow['order_code'] = item.order_order_code;
        }

        itemRow['customer_name'] = item.customers_full_name;
        itemRow['customer_mobile'] = item.customers_mobile;
        itemRow['product_name'] = item.orderItem_product_name;
        itemRow['order_first_at'] = yearMonthDayOrderAt;
        itemRow['by_date'] = byDate;
        itemRow['quantity'] = String(quantity);
        itemRow['quantity_using'] = String(quantity_using);
        itemRow['total_price'] = String(
          item.orderItem_price * quantity - item.orderItem_discount,
        );
        itemRow[yearOrderAt] = String(item.orderItem_quantity);
        itemRow[yearMonthOrderAt] = timeMonthOrderAt.split(',').length;
        mapCustomerProducts[keyMap] = itemRow;
      }
    }

    const rows = [];
    rows.push(Object.values(row1));
    const newRow1 = {};
    Object.entries(row1).map((x) => {
      newRow1[x[0]] = '';
    });

    Object.entries(mapCustomerProducts).map((x) => {
      const newRow = { ...newRow1, ...Object(x[1]) };
      rows.push(Object.values(newRow));
    });
    mapCustomerProducts = {};

    const data = await this.uploadFile(rows, 'chi_tiet_khach_hang_su_dung_the');

    return helper.success(data);
  }
  async uploadFile(row, name) {
    const fs = require('fs');
    const dir = './public';
    const date = new Date().getTime();

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const book = new Workbook();
    const sheet = book.addWorksheet('sheet1');
    sheet.addRows(row);
    const fileName = name + date + '.xlsx';
    const file = dir + '/' + fileName;

    await book.xlsx.writeFile(file);
    const urlS3 = await this.uploadFileS3(file, fileName);
    if (urlS3) {
      const fs = require('fs');
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
    return urlS3;
  }
  async uploadFileS3(file, name) {
    try {
      const fs = require('fs');
      var urlS3 = '';
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_CCCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
        region: 'hn',
        endpoint: process.env.REACT_APP_ENDPOINT,
      });

      await fs.readFile(file, (err, data) => {
        if (err) throw err;
        this.dataFile = data;
        const params = {
          Bucket: 'cent-beauty',
          Key: String(name),
          Body: data,
          ACL: 'public-read',
        };
        s3.upload(params, function (s3Err, data) {
          if (s3Err) throw s3Err;
        });
      });
      await new Promise((r) => setTimeout(r, 1500));
      var urlS3 = process.env.REACT_APP_S3_URL + name;
      return urlS3;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async processFile(content) {
    console.log(content);
  }
  async exportPackageDetail() {
    const start = new Date('2022-10-01');
    const end = new Date('2022-12-24');
    end.setDate(end.getDate() + 1);
    const orderItems = await this.orderItemRepo
      .createQueryBuilder('order_item')
      .where('order.soft_delete IS NULL')
      .andWhere('order.status = 3')
      // .andWhere('order.money_owed > 0')
      .leftJoinAndSelect('order_item.order', 'order')
      .andWhere('order.order_at BETWEEN :start_at AND :end_at', {
        start_at: startOfDay(start),
        end_at: endOfDay(end),
      })
      .getRawMany();

    const orderCodes = [];
    const dataOrderItemNew = {};
    for (const item of orderItems) {
      if (item.order_item_package_code) {
        orderCodes.push(item.order_order_code);
        dataOrderItemNew[item.order_order_code] = item;
      }
    }

    // return dataOrderItemNew
    const packages = await this.packageRepo
      .createQueryBuilder('package')
      .where('package.soft_delete IS NULL')
      .andWhere('package.order_code IN (:...order_code)', {
        order_code: orderCodes,
      })
      .andWhere('package.status = 1')
      .andWhere('customer.soft_delete IS NULL')
      .leftJoinAndSelect('package.customer', 'customer')
      .orderBy('customer.id', 'DESC')
      .getRawMany();

    const rowPackage = {};
    let i = 1;
    const packageCodes = [];
    for (const item of packages) {
      const defaultRow = { ...constant.exportPackageDetail };
      defaultRow.stt = String(i);
      defaultRow.customer_name = item.customer_full_name;
      defaultRow.customer_mobile = item.customer_mobile
        ? item.customer_mobile
        : item.package_customer_mobile;
      defaultRow.package_date = item.package_created_at;
      defaultRow.package_code = item.package_package_code;
      defaultRow.package_name = item.package_product_name;
      defaultRow.order_code = item.package_order_code;
      defaultRow.total_bill = String(
        dataOrderItemNew[item.package_order_code].order_total_price,
      );
      defaultRow.paid_mony = String(
        dataOrderItemNew[item.package_order_code].order_total_price -
          dataOrderItemNew[item.package_order_code].order_money_owed,
      );
      (defaultRow.owed_mony = String(
        Number(dataOrderItemNew[item.package_order_code].order_money_owed),
      )),
        (defaultRow.max_use =
          item.package_max_used > 100
            ? 'Vĩnh viễn'
            : String(item.package_max_used));
      defaultRow.use_mony = ' ';
      defaultRow.count_use = String(item.package_count_used);
      defaultRow.residual_use =
        item.package_max_used > 100
          ? 'Vĩnh viễn'
          : String(item.package_max_used - item.package_count_used);
      rowPackage[item.package_package_code] = defaultRow;
      i++;
      packageCodes.push(item.package_package_code);
    }

    const orderItemFindPackage = await this.orderItemRepo
      .createQueryBuilder('order_item')
      .where('order.soft_delete IS NULL')
      .andWhere('order.status = 3')
      .andWhere('order_item.package_code IN (:...package_code)', {
        package_code: packageCodes,
      })
      .leftJoinAndSelect('order_item.order', 'order')
      .getRawMany();

    const countUsing = {};

    const rowOne = { ...constant.exportPackageDetail };
    for (const item of orderItemFindPackage) {
      if (
        rowPackage[item.order_item_package_code] &&
        typeof rowPackage[item.order_item_package_code] != 'undefined'
      ) {
        if (
          item.order_item_package_code &&
          item.order_item_price == 0 &&
          !item.order_item_new_package
        ) {
          if (typeof countUsing[item.order_item_package_code] == 'undefined') {
            countUsing[item.order_item_package_code] = 1;
          } else {
            countUsing[item.order_item_package_code] += 1;
          }
          const dateUsing =
            'Dùng lần ' + countUsing[item.order_item_package_code];
          rowOne[dateUsing] = dateUsing;
          rowPackage[item.order_item_package_code][dateUsing] =
            item.order_order_at;

          // console.log(item.order_order_code, item.order_order_at, 2)
        }
      }
    }

    const rowPackageCheck = {};

    const rows = [];
    rows.push(Object.values(rowOne));
    const newRow1 = {};
    Object.entries(rowOne).map((x) => {
      newRow1[x[0]] = '';
    });

    Object.entries(rowPackage).map((x) => {
      console.log(x[1]['count_use'], countUsing[x[0]]);
      if (
        typeof countUsing[x[0]] != 'undefined' &&
        x[1]['count_use'] != countUsing[x[0]]
      ) {
        const newRow = { ...newRow1, ...Object(x[1]) };
        rows.push(Object.values(newRow));
      }
    });

    const urlS3 = await this.uploadFile(
      rows,
      'khach_hang_su_dung_the_xai_het_tien',
    );
    return urlS3;
  }
  async exportBill(startDate: string, endDate: string, limit, page) {
    try {
      const start = moment(new Date(startDate))
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const end = moment(new Date(endDate))
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss');

      const options = {
        limit: parseInt(limit) || 1000,
        page: parseInt(page) || 1,
      };
      const data = await paginate(this.orderItemRepo, options, {
        select: {
          id: true,
          product_name: true,
          discount: true,
          price: true,
          order: {
            id: true,
            order_at: true,
            status: true,
            staff_booking: true,
            source_from: true,
            description: true,
            isDeposit: true,
            order_code: true,
            sale_rule_applied_ids: true,
            payment_type: true,
            created_name: true,
            customer: {
              full_name: true,
              id: true,
              mobile: true,
            },
            stores: {
              id: true,
              name_store: true,
            },
          },
        },
        where: {
          order: {
            order_at: Between(new Date(start), new Date(end)),
            status: 3,
          },
        },
        relations: {
          order: {
            customer: true,
            stores: true,
          },
        },
        order: {
          order: {
            order_at: 'desc',
          },
        },
      });
      const newData = data.items.map((x) => {
        const y = {
          ...x,
          ...x.order,
          customer_name: x.order.customer?.full_name || '',
          customer_phone: x.order.customer?.mobile || '',
          store: x.order.stores.name_store,
          final_price: x.price - x.discount,
        };
        delete y.id;
        delete y.order;
        delete y.customer;
        delete y.stores;
        return y;
      });
      const res = await addRowSheet(newData);
      return helper.success({ meta: data.meta, res });
    } catch (error) {
      console.error(error);
      return helper.error(error);
    }
  }
}
