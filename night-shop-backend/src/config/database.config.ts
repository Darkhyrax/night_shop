import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config = {
    type: 'postgres',
    host: `${process.env.DB_HOST || 'localhost'}`,
    port: parseInt(`${process.env.DB_PORT || 5432}`, 10),
    username: `${process.env.DB_USER || 'postgres'}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_NAME || 'night_shop_db'}`,
    entities: [process.env.NODE_ENV === 'production' ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
    migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
    migrationsRun: true,
    autoLoadEntities: true,
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
