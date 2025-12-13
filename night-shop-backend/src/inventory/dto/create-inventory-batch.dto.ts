import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum CurrencyType {
    USD = 'usd',
    BS = 'bs',
}

export class CreateInventoryBatchDto {
    @ApiProperty({
        description: 'ID del producto',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        description: 'Código del lote',
        example: 'BATCH-001',
        required: false,
    })
    @IsString()
    @IsOptional()
    batchCode?: string;

    @ApiProperty({
        description: 'Moneda del costo (USD o BS)',
        enum: CurrencyType,
        example: 'usd',
    })
    @IsEnum(CurrencyType)
    @IsNotEmpty()
    costCurrency: CurrencyType;

    @ApiProperty({
        description: 'Costo total en la moneda seleccionada',
        example: 1000,
    })
    @IsNumber()
    @IsPositive()
    totalCost: number;

    @ApiProperty({
        description: 'ID de la tasa de cambio al momento de la compra',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    @IsUUID()
    @IsNotEmpty()
    purchaseExchangeRateId: string;

    @ApiProperty({
        description: 'Cantidad inicial en el lote',
        example: 50,
    })
    @IsNumber()
    @IsPositive()
    initialQuantity: number;

    @ApiProperty({
        description: 'Porcentaje de ganancia (0-100)',
        example: 30,
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    profitPercentage: number;

    @ApiProperty({
        description: 'Fecha de compra',
        example: '2025-12-13T00:00:00Z',
    })
    @Type(() => Date)
    @IsDate()
    purchaseDate: Date;

    @ApiProperty({
        description: 'Fecha de vencimiento',
        example: '2026-12-13T00:00:00Z',
        required: false,
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    expirationDate?: Date;
}
