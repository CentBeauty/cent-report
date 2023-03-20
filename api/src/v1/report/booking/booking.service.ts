import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, Between, In, Raw, Not, LessThan } from 'typeorm';
import { Booking } from '../../entities/bookings.entity';
const _ = require('lodash');
import { startOfDay, endOfDay } from 'date-fns';
import async from 'async';
import * as helper from '../../helpers/response';
import { LooseObject } from 'interfaces/looseObject.interface';
import { Like } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import * as moment from 'moment';
import { optionsSourceBooking } from '../../enums/booking.type';
import { bookingStatus } from '../../enums/booking.status';
@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) { }
  
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
  async bookingDash(query) {
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
          sales: grouped[property].length
        }
        rsType.push(ob)
      }

      for (const property in groupedStatus) {
        const ob = {
          type: bookingStatus[property],
          sales: groupedStatus[property].length
        }
        rsStatus.push(ob)
      }

      return helper.success({type:rsType,status:rsStatus,groupedStatus})
    } catch (error) {
      console.log(error)
      return helper.error(error)
    }
  }
}
