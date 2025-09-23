import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { SeedersModule } from './seeders/seeders.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig]
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const dbConfig = configService.get('typeorm');
                if (!dbConfig) {
                    throw new Error('Database configuration not found');
                }
                return dbConfig;
            }
        }),
        UsersModule,
        ProductsModule,
        InventoryModule,
        SalesModule,
        AuthModule,
        CustomersModule,
        ExchangeRatesModule,
        SeedersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
