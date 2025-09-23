import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

enum CurrencyType {
  USD = 'usd',
  BS = 'bs'
}

export class CreateInventoryBatchDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  batchCode: string;

  @IsEnum(CurrencyType)
  @IsNotEmpty()
  costCurrency: CurrencyType; // Moneda en la que se ingresa el costo (USD o BS)

  @IsNumber()
  @IsPositive()
  totalCost: number; // Costo total en la moneda seleccionada
  
  @IsUUID()
  @IsNotEmpty()
  purchaseExchangeRateId: string; // ID de la tasa de cambio al momento de la compra

  @IsNumber()
  @IsPositive()
  initialQuantity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  profitPercentage: number;

  @Type(() => Date)
  @IsDate()
  purchaseDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expirationDate?: Date;
}
