import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateCustomerPaymentDto {
  @ApiProperty({
    description: 'Monto pagado en USD',
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amountUsd: number;

  @ApiProperty({
    description: 'Monto pagado en Bolívares',
    example: 2500,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amountBs: number;

  @ApiProperty({
    description: 'ID de la tasa de cambio',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  exchangeRateId?: string;
}
