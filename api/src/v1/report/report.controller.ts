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
    CacheInterceptor
} from '@nestjs/common';
import { ReportsService } from './report.service';
@Controller()
@UseInterceptors(CacheInterceptor)
export class ReportsController {
    constructor(
        private readonly ReportsService: ReportsService,
    ) { }
    @Get('/quarter')
    async getReportOwed(@Query() query) {
        const {year} = query 
        return await this.ReportsService.dashboard(year)
    }
    @Get('/header')
    async headerDash() {
        return await this.ReportsService.headerDash()
    }
}