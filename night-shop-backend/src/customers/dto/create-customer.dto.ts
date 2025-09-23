import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
    @IsString()
    @IsNotEmpty()
    dni: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @Transform(({ value }) => value === '' ? null : value)
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
