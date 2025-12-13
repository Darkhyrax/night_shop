import './polyfills';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AdminUserSeeder } from './seeders/admin-user.seeder';
import { CustomerSeeder } from './seeders/customer.seeder';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Configuración CORS con variables de entorno
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: process.env.CORS_CREDENTIALS === 'true',
    });

    // Configuración Swagger/OpenAPI
    const config = new DocumentBuilder()
        .setTitle('Night Shop CMS API')
        .setDescription(
            'API para gestión de tiendas locales. Incluye ventas, inventario, clientes y reportes.',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Auth', 'Autenticación de usuarios')
        .addTag('Products', 'Gestión de productos e inventario')
        .addTag('Sales', 'Gestión de ventas')
        .addTag('Customers', 'Gestión de clientes y deudas')
        .addTag('ExchangeRates', 'Gestión de tasas de cambio')
        .addTag('Reports', 'Reportes y análisis')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Ejecutar seeders
    try {
        const adminSeeder = app.get(AdminUserSeeder);
        await adminSeeder.seed();
        const customerSeeder = app.get(CustomerSeeder);
        await customerSeeder.seed();
        logger.log('Seeders ejecutados correctamente');
    } catch (error) {
        logger.error(`Error al ejecutar seeders: ${error.message}`);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
