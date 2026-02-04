import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('sales')
    @ApiOperation({ summary: 'Reporte de ventas', description: 'Obtiene un reporte de ventas con filtros opcionales de fecha' })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de registros' })
    @ApiQuery({ name: 'offset', required: false, type: Number, example: 0, description: 'Desplazamiento' })
    @ApiResponse({ status: 200, description: 'Reporte de ventas' })
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
    @ApiOperation({ summary: 'Resumen de ventas', description: 'Obtiene un resumen de ventas por período' })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Resumen de ventas' })
    async getSalesSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getSalesSummary(startDate, endDate);
    }

    @Get('products/top')
    @ApiOperation({ summary: 'Productos más vendidos', description: 'Obtiene los productos más vendidos' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de productos' })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Lista de productos más vendidos' })
    async getTopProducts(
        @Query('limit') limit?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.reportsService.getTopProducts(limit || 10, startDate, endDate);
    }

    @Get('customers/top-debtors')
    @ApiOperation({ summary: 'Clientes con mayor deuda', description: 'Obtiene los clientes con mayor deuda pendiente' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de clientes' })
    @ApiResponse({ status: 200, description: 'Lista de clientes deudores' })
    async getTopDebtors(@Query('limit') limit?: number) {
        return this.reportsService.getTopDebtors(limit || 10);
    }

    @Get('customers/top')
    @ApiOperation({ summary: 'Clientes más activos', description: 'Obtiene los clientes con más compras' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de clientes' })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Lista de clientes más activos' })
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
    @ApiOperation({ summary: 'Inventario bajo', description: 'Obtiene productos con stock bajo' })
    @ApiQuery({ name: 'threshold', required: false, type: Number, example: 10, description: 'Límite de stock' })
    @ApiResponse({ status: 200, description: 'Lista de productos con stock bajo' })
    async getLowStockProducts(@Query('threshold') threshold?: number) {
        return this.reportsService.getLowStockProducts(threshold || 10);
    }

    @Get('debug/sales-dates')
    @ApiOperation({ summary: 'Debug - Fechas de ventas', description: 'Herramienta de depuración para verificar fechas de ventas' })
    @ApiResponse({ status: 200, description: 'Información de depuración' })
    async debugSalesDates() {
        return this.reportsService.debugSalesDates();
    }
}
