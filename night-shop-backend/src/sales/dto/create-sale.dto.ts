import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
    IsNumber,
    Min,
    IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSaleDetailDto } from './create-sale-detail.dto';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';
import { SaleType, ChangePaymentMethod } from '../entities/sale.entity';

export class CreateSaleDto {
    @ApiProperty({
        description: 'ID del usuario que realiza la venta',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Tipo de venta (CREDIT o CASH)',
        enum: SaleType,
        example: 'CASH',
    })
    @IsEnum(SaleType)
    @IsNotEmpty()
    saleType: SaleType;

    @ApiProperty({
        description: 'ID del cliente (requerido para ventas a crédito)',
        example: '550e8400-e29b-41d4-a716-446655440001',
        required: false,
    })
    @IsUUID()
    @IsOptional()
    customerId?: string;

    @ApiProperty({
        description: 'Datos del nuevo cliente (si se crea en el momento)',
        type: CreateCustomerDto,
        required: false,
    })
    @ValidateNested()
    @Type(() => CreateCustomerDto)
    @IsOptional()
    newCustomer?: CreateCustomerDto;

    @ApiProperty({
        description: 'Notas adicionales de la venta',
        example: 'Entrega a domicilio',
        required: false,
    })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({
        description: 'Monto pagado en Bolívares',
        example: 2500,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    paidAmountBs?: number;

    @ApiProperty({
        description: 'Monto pagado en USD',
        example: 100,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    paidAmountUsd?: number;

    @ApiProperty({
        description: 'Cambio en USD',
        example: 10,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    changeUsd?: number;

    @ApiProperty({
        description: 'Cambio en Bolívares',
        example: 250,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    changeBS?: number;

    @ApiProperty({
        description: 'Método de retorno del cambio (USD, BS, MIXED)',
        enum: ChangePaymentMethod,
        required: false,
    })
    @IsEnum(ChangePaymentMethod)
    @IsOptional()
    changePaymentMethod?: ChangePaymentMethod;

    @ApiProperty({
        description: 'Pago a crédito en USD',
        example: 50,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    creditPaymentUsd?: number;

    @ApiProperty({
        description: 'Pago a crédito en Bolívares',
        example: 1250,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    creditPaymentBs?: number;

    @ApiProperty({
        description: 'Detalles de los productos en la venta',
        type: [CreateSaleDetailDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateSaleDetailDto)
    saleDetails: CreateSaleDetailDto[];
}
