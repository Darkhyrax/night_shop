import { IsNotEmpty, IsNumber, IsDate, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExchangeRateDto {
  @IsNotEmpty()
  @IsNumber()
  rate: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
