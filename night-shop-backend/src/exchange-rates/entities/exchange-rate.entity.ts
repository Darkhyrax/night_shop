import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 15, scale: 2 })
    rate: number; // Tasa de cambio (1 USD = X Bs)

    @Column({ type: 'date' })
    effectiveDate: Date; // Fecha en que aplica esta tasa

    @Column({ default: false })
    isActive: boolean; // Indica si es la tasa activa actual

    @Column({ nullable: true })
    source: string; // Fuente de la tasa (BCV, paralelo, etc.)

    @Column({ nullable: true })
    notes: string; // Notas adicionales

    @Column({ default: 'BCV', name: 'rate_type' })
    rateType: 'BCV' | 'CUSTOM'; // Tipo de tasa: BCV (automática) o CUSTOM (manual)

    @Column({ default: false, name: 'is_manually_set' })
    isManuallySet: boolean; // Indica si fue establecida manualmente por usuario

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
