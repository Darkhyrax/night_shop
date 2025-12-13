import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryBatchDto } from './dto/create-inventory-batch.dto';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Post('batches')
    createBatch(
        @Body() createInventoryBatchDto: CreateInventoryBatchDto,
    ): Promise<InventoryBatch> {
        return this.inventoryService.createBatch(createInventoryBatchDto);
    }

    @Get('batches')
    findAllBatches(): Promise<InventoryBatch[]> {
        return this.inventoryService.findAllBatches();
    }

    @Get('batches/:id')
    findBatch(@Param('id') id: string): Promise<InventoryBatch> {
        return this.inventoryService.findBatch(id);
    }

    @Get('products/:productId/batches')
    findBatchesByProduct(
        @Param('productId') productId: string,
    ): Promise<InventoryBatch[]> {
        return this.inventoryService.findBatchesByProduct(productId);
    }

    @Patch('batches/:id/quantity/:change')
    updateBatchQuantity(
        @Param('id') id: string,
        @Param('change') change: number,
    ): Promise<InventoryBatch> {
        return this.inventoryService.updateBatchQuantity(id, Number(change));
    }
}
