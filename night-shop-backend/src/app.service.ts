import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductSeeder } from './seeders/product.seeder';
import { ExchangeRateSeeder } from './seeders/exchange-rate.seeder';

@Injectable()
export class AppService implements OnModuleInit {
    constructor(
        private configService: ConfigService,
        private productSeeder: ProductSeeder,
        private exchangeRateSeeder: ExchangeRateSeeder,
    ) {}

    async onModuleInit(): Promise<void> {
        const seedInitialData = this.configService.get<string>('SEED_INITIAL_DATA');
        if (seedInitialData === 'true') {
            try {
                // Ejecutar seeder de tasa de cambio primero
                await this.exchangeRateSeeder.seed();
                // Luego ejecutar seeder de producto
                await this.productSeeder.seed();
            } catch (error) {
                console.error('Error ejecutando seeders:', error);
            }
        }
    }

    getHello(): string {
        return 'Hello World!';
    }
}
