import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1755881000000 implements MigrationInterface {
    name = 'InitialSchema1755881000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing tables if they exist (in reverse order of dependencies)
        await queryRunner.query(
            `DROP TABLE IF EXISTS "exchange_rate_sync_logs" CASCADE`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS "customer_payments" CASCADE`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS "customer_accounts" CASCADE`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "sale_details" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sales" CASCADE`);
        await queryRunner.query(
            `DROP TABLE IF EXISTS "inventory_batches" CASCADE`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "customers" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "products" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await queryRunner.query(
            `DROP TABLE IF EXISTS "exchange_rates" CASCADE`,
        );

        // Drop existing enums if they exist
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."payment_currency_enum" CASCADE`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."sales_status_enum" CASCADE`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."users_role_enum" CASCADE`,
        );

        // Create enums
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'employee')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."sales_status_enum" AS ENUM('pending', 'completed')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."payment_currency_enum" AS ENUM('usd', 'bs')`,
        );

        // Create exchange_rates table
        await queryRunner.query(`
      CREATE TABLE "exchange_rates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rate" numeric(15,2) NOT NULL,
        "effectiveDate" date NOT NULL,
        "isActive" boolean NOT NULL DEFAULT false,
        "source" character varying,
        "notes" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exchange_rates_id" PRIMARY KEY ("id")
      )
    `);

        // Create exchange_rate_sync_logs table
        await queryRunner.query(`
      CREATE TABLE "exchange_rate_sync_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "synced_at" TIMESTAMP NOT NULL DEFAULT now(),
        "success" boolean NOT NULL DEFAULT false,
        "error_message" text,
        "rate" numeric(10,2),
        "source" character varying(50) NOT NULL DEFAULT 'BCV',
        CONSTRAINT "PK_exchange_rate_sync_logs_id" PRIMARY KEY ("id")
      )
    `);

        // Create indices for exchange_rate_sync_logs
        await queryRunner.query(
            `CREATE INDEX "IDX_exchange_rate_sync_logs_synced_at" ON "exchange_rate_sync_logs" ("synced_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_exchange_rate_sync_logs_success" ON "exchange_rate_sync_logs" ("success")`,
        );

        // Create users table
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "phoneNumber" character varying NOT NULL,
        "dni" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
        CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE ("dni"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

        // Create products table
        await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "imageUrl" character varying,
        "currentCostPrice" numeric(10,2) NOT NULL DEFAULT '0',
        "currentProfitPercentage" numeric(5,2) NOT NULL DEFAULT '0',
        "currentSellingPrice" numeric(10,2) NOT NULL DEFAULT '0',
        "totalStock" integer NOT NULL DEFAULT '0',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
      )
    `);

        // Create inventory_batches table
        await queryRunner.query(`
      CREATE TABLE "inventory_batches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "batchCode" character varying NOT NULL,
        "totalCostUsd" numeric(10,2) NOT NULL,
        "totalCostBs" numeric(10,2) NOT NULL DEFAULT 0,
        "unitCostUsd" numeric(10,2) NOT NULL DEFAULT 0,
        "unitCostBs" numeric(10,2) NOT NULL DEFAULT 0,
        "sellingPriceUsd" numeric(10,2) NOT NULL DEFAULT 0,
        "initialQuantity" integer NOT NULL,
        "currentQuantity" integer NOT NULL,
        "profitPercentage" numeric(5,2) NOT NULL,
        "costCurrency" character varying NOT NULL DEFAULT 'usd',
        "purchaseDate" date NOT NULL,
        "expirationDate" TIMESTAMP,
        "purchase_exchange_rate_id" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1b670b7f687d8b8c58ef8d4629a" PRIMARY KEY ("id"),
        CONSTRAINT "FK_9350781ae7a615d184b56660e31" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_inventory_batches_exchange_rates" FOREIGN KEY ("purchase_exchange_rate_id") REFERENCES "exchange_rates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

        // Create customers table
        await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "dni" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "email" character varying(255),
        "phone" character varying(50),
        "address" character varying(255),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_379e00d128aa2a5da2514e7a6ff" UNIQUE ("dni"),
        CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id")
      )
    `);

        // Create enums for sales
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."sale_type_enum" CASCADE`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."change_payment_method_enum" CASCADE`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."sale_type_enum" AS ENUM('credit', 'cash')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."change_payment_method_enum" AS ENUM('usd', 'bs', 'mixed')`,
        );

        // Create sales table
        await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "status" "public"."sales_status_enum" NOT NULL DEFAULT 'pending',
        "sale_type" "public"."sale_type_enum" NOT NULL DEFAULT 'cash',
        "total_amount_usd" numeric(10,2) NOT NULL,
        "total_amount_bs" numeric(10,2) NOT NULL,
        "exchange_rate_id" uuid NOT NULL,
        "paid_amount_bs" numeric(10,2) NOT NULL DEFAULT 0,
        "paid_amount_usd" numeric(10,2) NOT NULL DEFAULT 0,
        "change_usd" numeric(10,2) NOT NULL DEFAULT 0,
        "change_bs" numeric(10,2) NOT NULL DEFAULT 0,
        "change_total_usd" numeric(10,2) NOT NULL DEFAULT 0,
        "change_payment_method" "public"."change_payment_method_enum",
        "user_id" uuid NOT NULL,
        "customer_id" uuid,
        "notes" character varying(500),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"),
        CONSTRAINT "FK_5f282f3656814ec9ca2675aef6f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_c51005b2b06cec7aa17462c54f5" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_exchange_rate_id" FOREIGN KEY ("exchange_rate_id") REFERENCES "exchange_rates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

        // Create sale_details table
        await queryRunner.query(`
      CREATE TABLE "sale_details" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sale_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "inventory_batch_id" uuid,
        "quantity" integer NOT NULL,
        "unitPriceUsd" numeric(10,2) NOT NULL,
        "unitPriceBs" numeric(10,2) NOT NULL,
        "subtotalUsd" numeric(10,2) NOT NULL,
        "subtotalBs" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_a8e8b6d243f38e3587378d401f5" PRIMARY KEY ("id"),
        CONSTRAINT "FK_245bcd4eb6fe045d6925d9a0a29" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_ff07d1ac574d56390cf66820fae" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_bb8b636ff2f947eafd0a72b4994" FOREIGN KEY ("inventory_batch_id") REFERENCES "inventory_batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

        // Create customer_accounts table
        await queryRunner.query(`
      CREATE TABLE "customer_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "sale_id" uuid NOT NULL,
        "debtUsd" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_accounts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer_accounts_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_customer_accounts_sale_id" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

        // Create customer_payments table
        await queryRunner.query(`
      CREATE TABLE "customer_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "customer_account_id" uuid NOT NULL,
        "amountUsd" numeric(10,2) NOT NULL,
        "paidInCurrency" "public"."payment_currency_enum" NOT NULL,
        "amountPaidInOriginalCurrency" numeric(10,2) NOT NULL,
        "exchange_rate_id" uuid,
        "is_initial_payment" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_customer_payments_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_customer_payments_customer_account_id" FOREIGN KEY ("customer_account_id") REFERENCES "customer_accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_customer_payments_exchange_rate_id" FOREIGN KEY ("exchange_rate_id") REFERENCES "exchange_rates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order of creation
        await queryRunner.query(
            `DROP TABLE IF EXISTS "exchange_rate_sync_logs" CASCADE`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS "customer_payments" CASCADE`,
        );
        await queryRunner.query(
            `DROP TABLE IF EXISTS "customer_accounts" CASCADE`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "sale_details" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sales" CASCADE`);
        await queryRunner.query(
            `DROP TABLE IF EXISTS "inventory_batches" CASCADE`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "customers" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "products" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await queryRunner.query(
            `DROP TABLE IF EXISTS "exchange_rates" CASCADE`,
        );

        // Drop enums
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."payment_currency_enum"`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."sales_status_enum"`,
        );
        await queryRunner.query(
            `DROP TYPE IF EXISTS "public"."users_role_enum"`,
        );
    }
}
