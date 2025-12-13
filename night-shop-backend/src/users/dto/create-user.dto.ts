import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Apellido del usuario',
        example: 'Pérez',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'Contraseña (mínimo 6 caracteres)',
        example: 'password123',
    })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'Rol del usuario',
        enum: UserRole,
        example: UserRole.ADMIN,
    })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({
        description: 'Número de teléfono',
        example: '+58-412-1234567',
    })
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        description: 'Documento de identidad',
        example: '12345678',
    })
    @IsString()
    @IsNotEmpty()
    dni: string;

    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'juanperez',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Estado activo del usuario',
        example: true,
        required: false,
    })
    @IsBoolean()
    isActive?: boolean;
}
