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
import { AccountantReportsService } from "./accountant.report.service"
@Controller('accountant')
@UseInterceptors(CacheInterceptor)
export class AccountantReportsController {
    constructor(
        private readonly AccountantReportsService: AccountantReportsService,
    ) { }
    @Get('/owed')
    async getReportOwed(@Query() query) {
        return await this.AccountantReportsService.getReportOwed(query)
    }

    @Get('/announce-package')
    async AnnouncePackage(@Query() query) {
        return await this.AccountantReportsService.AnnouncePackage(query)
    }

    @Get('/customer-package')
    async CustomerPackage(@Query() query) {
        return await this.AccountantReportsService.CustomerPackage(query)
    }
    
    @Get('/customer-active')
    async activeCustomer(@Query() query) {
        return await this.AccountantReportsService.activeCustomer(query)
    }

    @Get('/discount')
    async discount(@Query() query) {
        return await this.AccountantReportsService.discount(query)
    }
    @Get('/collection')
    async collection(@Query() query) {
        return await this.AccountantReportsService.collection(query)
    }

    @Get('/count-service-ktv')
    async countServicesKtv(@Query() query) {
        return await this.AccountantReportsService.countServicesKtv(query)
    }
    @Get('/package-not-use')
    async packageNotUse(@Query() query) {
        return await this.AccountantReportsService.packageNotUse(query)
    }
    @Get('/customer-paid')
    async customerPaid(@Query() query) {
        return await this.AccountantReportsService.customerPaid(query)
    }
    @Get('/customers')
    async customers(@Query() query) {
        return await this.AccountantReportsService.customers(query)
    }
    @Get('/package-receipt')
    async packageReceipt() {
        return await this.AccountantReportsService.packageReceipt()
    }
}