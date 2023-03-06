import {
    Body,
    Controller,
    Delete,
    Post,
    Get,
    Param,
    Put,
    ParseIntPipe,
    UseGuards,
    Query,
    Res,
    Header, StreamableFile
} from '@nestjs/common';
import { ExportService } from './export.service';
import { OrderListParam } from './order.interface';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';


@Controller('export')
export class ExportCustomerServiceController {
    constructor(
        private readonly exportService: ExportService
    ) { }

    @Get('customer-service')
    @Header('Content-Type', 'application/json')
    async exportOrderList() {
        return await this.exportService.exportCustomerService();
    }

    @Get('bill')
    async exportBill(@Query() query) {
        const { start, end,limit,page } = query
        return await this.exportService.exportBill(start, end,limit,page)
    }
}