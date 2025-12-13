import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
    @ApiProperty({
        description: 'Documento de identidad del cliente',
        example: '12345678',
    })
    @IsString()
    @IsNotEmpty()
    dni: string;

    @ApiProperty({
        description: 'Nombre del cliente',
        example: 'Juan',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Apellido del cliente',
        example: 'Pérez',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'Email del cliente',
        example: 'juan@example.com',
        required: false,
    })
    @Transform(({ value }) => (value === '' ? null : value))
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        description: 'Teléfono del cliente',
        example: '+58-412-1234567',
    })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        description: 'Dirección del cliente',
        example: 'Calle Principal 123',
        required: false,
    })
    @IsString()
    @IsOptional()
    address?: string;
}
