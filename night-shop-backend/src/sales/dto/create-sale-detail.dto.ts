import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDetailDto {
    @ApiProperty({
        description: 'ID del producto',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'ID del lote de inventario',
        example: '550e8400-e29b-41d4-a716-446655440001',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    inventoryBatchId?: string;

    @ApiProperty({
        description: 'Cantidad de productos',
        example: 5,
    })
    @IsNumber()
    @IsPositive()
    quantity: number;
}
