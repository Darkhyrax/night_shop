import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear producto', description: 'Crea un nuevo producto en el catálogo' })
    @ApiBody({ type: CreateProductDto })
    @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    create(@Body() createProductDto: CreateProductDto): Promise<Product> {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar productos', description: 'Obtiene la lista de todos los productos activos' })
    @ApiResponse({ status: 200, description: 'Lista de productos' })
    findAll(): Promise<Product[]> {
        return this.productsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener producto', description: 'Obtiene los datos de un producto específico' })
    @ApiParam({ name: 'id', description: 'ID del producto' })
    @ApiResponse({ status: 200, description: 'Datos del producto' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    findOne(@Param('id') id: string): Promise<Product> {
        return this.productsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza los datos de un producto' })
    @ApiParam({ name: 'id', description: 'ID del producto' })
    @ApiBody({ type: UpdateProductDto })
    @ApiResponse({ status: 200, description: 'Producto actualizado' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar producto', description: 'Desactiva un producto (soft delete)' })
    @ApiParam({ name: 'id', description: 'ID del producto' })
    @ApiResponse({ status: 200, description: 'Producto eliminado' })
    @ApiResponse({ status: 404, description: 'Producto no encontrado' })
    remove(@Param('id') id: string): Promise<void> {
        return this.productsService.remove(id);
    }
}
