import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { FixSaleStatusService } from './fix-sale-status.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale, SaleStatus } from './entities/sale.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
        private readonly fixSaleStatusService: FixSaleStatusService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Crear venta', description: 'Registra una nueva venta (contado o crédito)' })
    @ApiBody({ type: CreateSaleDto })
    @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
        return this.salesService.create(createSaleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar ventas', description: 'Obtiene la lista de todas las ventas' })
    @ApiResponse({ status: 200, description: 'Lista de ventas' })
    findAll(): Promise<Sale[]> {
        return this.salesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener venta', description: 'Obtiene los datos de una venta específica' })
    @ApiParam({ name: 'id', description: 'ID de la venta' })
    @ApiResponse({ status: 200, description: 'Datos de la venta' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada' })
    findOne(@Param('id') id: string): Promise<Sale> {
        return this.salesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar venta', description: 'Actualiza los datos de una venta' })
    @ApiParam({ name: 'id', description: 'ID de la venta' })
    @ApiBody({ type: UpdateSaleDto })
    @ApiResponse({ status: 200, description: 'Venta actualizada' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada' })
    update(
        @Param('id') id: string,
        @Body() updateSaleDto: UpdateSaleDto,
    ): Promise<Sale> {
        return this.salesService.update(id, updateSaleDto);
    }

    @Patch(':id/status/:status')
    @ApiOperation({ summary: 'Cambiar estado de venta', description: 'Cambia el estado de una venta (PENDING o COMPLETED)' })
    @ApiParam({ name: 'id', description: 'ID de la venta' })
    @ApiParam({ name: 'status', description: 'Nuevo estado (PENDING o COMPLETED)' })
    @ApiResponse({ status: 200, description: 'Estado actualizado' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada' })
    updateStatus(
        @Param('id') id: string,
        @Param('status') status: SaleStatus,
    ): Promise<Sale> {
        return this.salesService.updateStatus(id, status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar venta', description: 'Elimina una venta' })
    @ApiParam({ name: 'id', description: 'ID de la venta' })
    @ApiResponse({ status: 200, description: 'Venta eliminada' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada' })
    remove(@Param('id') id: string): Promise<void> {
        return this.salesService.remove(id);
    }

    @Post(':id/payments')
    @ApiOperation({ summary: 'Registrar pago', description: 'Registra un pago o abono a una venta' })
    @ApiParam({ name: 'id', description: 'ID de la venta' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amountUsd: { type: 'number', example: 10.5 },
                amountBs: { type: 'number', example: 5000 },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Pago registrado' })
    @ApiResponse({ status: 404, description: 'Venta no encontrada' })
    addPayment(
        @Param('id') id: string,
        @Body() paymentDto: { amountUsd: number; amountBs: number },
    ): Promise<Sale> {
        return this.salesService.addPayment(id, paymentDto);
    }

    @Post('fix/statuses')
    @ApiOperation({ summary: 'Corregir estados de ventas', description: 'Herramienta de administración para corregir estados inconsistentes' })
    @ApiResponse({ status: 200, description: 'Estados corregidos' })
    fixSaleStatuses(): Promise<any> {
        return this.fixSaleStatusService.fixSaleStatuses();
    }
}
