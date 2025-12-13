import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('sales')
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
    async getSalesReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.reportsService.getSalesReport(
            startDate,
            endDate,
            limit || 10,
            offset || 0,
        );
    }

    @Get('sales/summary')
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    async getSalesSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getSalesSummary(startDate, endDate);
    }

    @Get('products/top')
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    async getTopProducts(
        @Query('limit') limit?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getTopProducts(limit || 10, startDate, endDate);
    }

    @Get('customers/top-debtors')
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async getTopDebtors(@Query('limit') limit?: number) {
        return this.reportsService.getTopDebtors(limit || 10);
    }

    @Get('customers/top')
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    async getTopCustomers(
        @Query('limit') limit?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getTopCustomers(
            limit || 10,
            startDate,
            endDate,
        );
    }

    @Get('inventory/low-stock')
    @ApiQuery({ name: 'threshold', required: false, type: Number, example: 10 })
    async getLowStockProducts(@Query('threshold') threshold?: number) {
        return this.reportsService.getLowStockProducts(threshold || 10);
    }
}
