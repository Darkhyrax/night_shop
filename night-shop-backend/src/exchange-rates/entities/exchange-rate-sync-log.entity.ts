import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('exchange_rate_sync_logs')
export class ExchangeRateSyncLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'synced_at' })
    syncedAt: Date;

    @Column({ type: 'boolean' })
    success: boolean;

    @Column({ type: 'text', nullable: true, name: 'error_message' })
    errorMessage: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    rate: number | null;

    @Column({ type: 'varchar', length: 50, default: 'BCV' })
    source: string;
}
