import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLogoDataToText1755900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE company_config
      ALTER COLUMN "logoData" TYPE text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE company_config
      ALTER COLUMN "logoData" TYPE bytea
    `);
  }
}
