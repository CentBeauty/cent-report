import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ReportsService } from './report.service';
@Controller()
@UseInterceptors(CacheInterceptor)
export class ReportsController {
  constructor(private readonly ReportsService: ReportsService) {}
  @Get('/quarter')
  async getReportOwed(@Query() query) {
    const { year } = query;
    return await this.ReportsService.dashboard(year);
  }
  @Get('/header')
  async headerDash() {
    return await this.ReportsService.headerDash();
  }
  @Get('/booking-table')
  async bookings(@Query() query) {
    return await this.ReportsService.bookingTable(query)
  }
  @Get('/booking-type')
  async bookingDashType(@Query() query) {
    return await this.ReportsService.bookingDashType(query)
  }
}
