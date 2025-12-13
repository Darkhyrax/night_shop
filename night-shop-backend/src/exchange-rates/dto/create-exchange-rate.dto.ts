import {
    IsNotEmpty,
    IsNumber,
    IsDate,
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExchangeRateDto {
    @ApiProperty({
        description: 'Tasa de cambio USD a BS',
        example: 25.5,
    })
    @IsNotEmpty()
    @IsNumber()
    rate: number;

    @ApiProperty({
        description: 'Fecha efectiva de la tasa',
        example: '2025-12-13T00:00:00Z',
    })
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    effectiveDate: Date;

    @ApiProperty({
        description: 'Indica si la tasa está activa',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Fuente de la tasa de cambio',
        example: 'Banco Central',
        required: false,
    })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiProperty({
        description: 'Notas adicionales',
        example: 'Tasa oficial del día',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
