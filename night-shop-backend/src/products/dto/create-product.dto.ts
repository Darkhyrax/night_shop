import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({
        description: 'Nombre del producto',
        example: 'Laptop Dell',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Descripción del producto',
        example: 'Laptop Dell XPS 13',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'URL de la imagen del producto',
        example: 'https://example.com/image.jpg',
        required: false,
    })
    @IsString()
    @IsOptional()
    imageUrl?: string;
}
