import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Patch,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Post('batches')
    @ApiOperation({ summary: 'Crear lote de inventario', description: 'Crea un nuevo lote de compra' })
    @ApiBody({ type: CreateInventoryBatchDto })
    @ApiResponse({ status: 201, description: 'Lote creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    createBatch(
        @Body() createInventoryBatchDto: CreateInventoryBatchDto,
    ): Promise<InventoryBatch> {
        return this.inventoryService.createBatch(createInventoryBatchDto);
    }

    @Get('batches')
    @ApiOperation({ summary: 'Listar lotes', description: 'Obtiene todos los lotes de inventario' })
    @ApiResponse({ status: 200, description: 'Lista de lotes' })
    findAllBatches(): Promise<InventoryBatch[]> {
        return this.inventoryService.findAllBatches();
    }

    @Get('batches/:id')
    @ApiOperation({ summary: 'Obtener lote', description: 'Obtiene un lote específico' })
    @ApiParam({ name: 'id', description: 'ID del lote' })
    @ApiResponse({ status: 200, description: 'Datos del lote' })
    @ApiResponse({ status: 404, description: 'Lote no encontrado' })
    findBatch(@Param('id') id: string): Promise<InventoryBatch> {
        return this.inventoryService.findBatch(id);
    }

    @Get('products/:productId/batches')
    @ApiOperation({ summary: 'Lotes por producto', description: 'Obtiene todos los lotes de un producto' })
    @ApiParam({ name: 'productId', description: 'ID del producto' })
    @ApiResponse({ status: 200, description: 'Lista de lotes del producto' })
    findBatchesByProduct(
        @Param('productId') productId: string,
    ): Promise<InventoryBatch[]> {
        return this.inventoryService.findBatchesByProduct(productId);
    }

    @Patch('batches/:id/quantity/:change')
    @ApiOperation({ summary: 'Actualizar cantidad', description: 'Actualiza la cantidad de un lote' })
    @ApiParam({ name: 'id', description: 'ID del lote' })
    @ApiParam({ name: 'change', description: 'Cambio en cantidad (positivo o negativo)' })
    @ApiResponse({ status: 200, description: 'Cantidad actualizada' })
    @ApiResponse({ status: 404, description: 'Lote no encontrado' })
    updateBatchQuantity(
        @Param('id') id: string,
        @Param('change') change: number,
    ): Promise<InventoryBatch> {
        return this.inventoryService.updateBatchQuantity(id, Number(change));
    }

    @Delete('batches/:id')
    @ApiOperation({ summary: 'Eliminar lote', description: 'Elimina un lote de inventario' })
    @ApiParam({ name: 'id', description: 'ID del lote' })
    @ApiResponse({ status: 200, description: 'Lote eliminado' })
    @ApiResponse({ status: 404, description: 'Lote no encontrado' })
    deleteBatch(@Param('id') id: string): Promise<void> {
        return this.inventoryService.deleteBatch(id);
    }

    @Patch('batches/:id')
    @ApiOperation({ summary: 'Actualizar lote', description: 'Actualiza datos de un lote' })
    @ApiParam({ name: 'id', description: 'ID del lote' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                batchCode: { type: 'string' },
                profitPercentage: { type: 'number' },
                expirationDate: { type: 'string', format: 'date' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Lote actualizado' })
    @ApiResponse({ status: 404, description: 'Lote no encontrado' })
    updateBatch(
        @Param('id') id: string,
        @Body() updateData: {
            batchCode?: string;
            profitPercentage?: number;
            expirationDate?: Date;
        },
    ): Promise<InventoryBatch> {
        return this.inventoryService.updateBatch(id, updateData);
    }
}
