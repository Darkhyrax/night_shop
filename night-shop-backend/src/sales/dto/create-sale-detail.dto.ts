import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateSaleDetailDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsOptional()
    @IsUUID()
    inventoryBatchId?: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}
