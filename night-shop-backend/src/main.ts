import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AdminUserSeeder } from './seeders/admin-user.seeder';

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

    // Ejecutar seeders
    try {
        const adminSeeder = app.get(AdminUserSeeder);
        await adminSeeder.seed();
        logger.log('Seeders ejecutados correctamente');
    } catch (error) {
        logger.error(`Error al ejecutar seeders: ${error.message}`);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
