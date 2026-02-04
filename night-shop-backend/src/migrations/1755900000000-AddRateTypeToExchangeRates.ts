import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRateTypeToExchangeRates1755900000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'exchange_rates',
            new TableColumn({
                name: 'rate_type',
                type: 'varchar',
                default: "'BCV'",
            }),
        );

        await queryRunner.addColumn(
            'exchange_rates',
            new TableColumn({
                name: 'is_manually_set',
                type: 'boolean',
                default: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('exchange_rates', 'is_manually_set');
        await queryRunner.dropColumn('exchange_rates', 'rate_type');
    }
}
