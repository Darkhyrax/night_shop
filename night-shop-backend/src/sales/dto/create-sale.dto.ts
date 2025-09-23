import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested, IsNumber, Min } from 'class-validator';
import { SaleStatus, CurrencyType } from '../entities/sale.entity';
import { CreateSaleDetailDto } from './create-sale-detail.dto';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';

export class CreateSaleDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;
  
  @IsEnum(CurrencyType)
  @IsOptional()
  currency?: CurrencyType;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ValidateNested()
  @Type(() => CreateCustomerDto)
  @IsOptional()
  newCustomer?: CreateCustomerDto;

  @IsString()
  @IsOptional()
  notes?: string;
  
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmountBs?: number;
  
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmountUsd?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleDetailDto)
  saleDetails: CreateSaleDetailDto[];
}
