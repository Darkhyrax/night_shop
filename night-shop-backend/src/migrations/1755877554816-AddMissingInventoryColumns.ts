import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingInventoryColumns1755877554816 implements MigrationInterface {
    name = 'AddMissingInventoryColumns1755877554816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renombrar la columna totalCost a totalCostUsd para mantener los datos existentes
        await queryRunner.query(`ALTER TABLE "inventory_batches" RENAME COLUMN "totalCost" TO "totalCostUsd"`);
        
        // Añadir las columnas necesarias para manejar costos en ambas monedas
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD "totalCostBs" numeric(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD "unitCostUsd" numeric(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD "unitCostBs" numeric(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD "sellingPriceUsd" numeric(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD "purchase_exchange_rate_id" uuid`);
        
        // Añadir columna para indicar la moneda en que se registró el costo
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD "costCurrency" character varying NOT NULL DEFAULT 'usd'`);
        
        // Crear la relación con la tabla de tasas de cambio
        await queryRunner.query(`ALTER TABLE "inventory_batches" ADD CONSTRAINT "FK_inventory_batches_exchange_rates" FOREIGN KEY ("purchase_exchange_rate_id") REFERENCES "exchange_rates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la restricción de clave foránea
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP CONSTRAINT "FK_inventory_batches_exchange_rates"`);
        
        // Eliminar las columnas añadidas
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN "costCurrency"`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN "purchase_exchange_rate_id"`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN "sellingPriceUsd"`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN "unitCostBs"`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN "unitCostUsd"`);
        await queryRunner.query(`ALTER TABLE "inventory_batches" DROP COLUMN "totalCostBs"`);
        
        // Renombrar la columna totalCostUsd de vuelta a totalCost
        await queryRunner.query(`ALTER TABLE "inventory_batches" RENAME COLUMN "totalCostUsd" TO "totalCost"`);
    }
}
