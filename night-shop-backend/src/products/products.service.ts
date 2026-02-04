import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        // Verificar si el producto ya existe (por nombre, ignorando mayúsculas/minúsculas)
        const existingProduct = await this.productsRepository.findOne({
            where: {
                name: createProductDto.name,
                isActive: true,
            },
        });

        if (existingProduct) {
            throw new ConflictException(
                `El producto "${createProductDto.name}" ya existe`,
            );
        }

        const product = this.productsRepository.create({
            ...createProductDto,
            currentCostPrice: 0,
            currentProfitPercentage: 0,
            currentSellingPrice: 0,
            totalStock: 0,
        });

        return this.productsRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return this.productsRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['inventoryBatches'],
        });

        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found`);
        }

        return product;
    }

    async update(
        id: string,
        updateProductDto: UpdateProductDto,
    ): Promise<Product> {
        const product = await this.findOne(id);

        Object.assign(product, updateProductDto);

        return this.productsRepository.save(product);
    }

    async updatePricing(
        id: string,
        costPrice: number,
        profitPercentage: number,
        sellingPrice: number,
    ): Promise<Product> {
        const product = await this.findOne(id);

        product.currentCostPrice = costPrice;
        product.currentProfitPercentage = profitPercentage;
        product.currentSellingPrice = sellingPrice;

        return this.productsRepository.save(product);
    }

    async updateDualPricing(
        id: string,
        costPrice: number,
        profitPercentage: number,
        sellingPrice: number,
    ): Promise<Product> {
        const product = await this.findOne(id);

        product.currentCostPrice = costPrice;
        product.currentProfitPercentage = profitPercentage;
        product.currentSellingPrice = sellingPrice;

        return this.productsRepository.save(product);
    }

    async updateStock(id: string, newTotalStock: number): Promise<Product> {
        const product = await this.findOne(id);

        product.totalStock = newTotalStock;

        return this.productsRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        product.isActive = false;
        await this.productsRepository.save(product);
    }
}
