import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Usuario',
        example: 'admin',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Contraseña',
        example: 'password123',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
