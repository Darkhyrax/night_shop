import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '.env' });

const config = {
    type: 'postgres',
    host: `${process.env.DATABASE_HOST}`,
    port: parseInt(`${process.env.DATABASE_PORT}`, 10),
    username: `${process.env.DATABASE_USERNAME}`,
    password: `${process.env.DATABASE_PASSWORD}`,
    database: `${process.env.DATABASE_NAME}`,
    entities: ["src/**/*.entity.ts"],
    migrations: ["src/migrations/*.ts"],
    autoLoadEntities: true,
    synchronize: false,
    cli: {
        migrationsDir: 'src/migrations',
    },
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);
