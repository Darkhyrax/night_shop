import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ExchangeRate } from '../../exchange-rates/entities/exchange-rate.entity';

@Entity('inventory_batches')
export class InventoryBatch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, (product) => product.inventoryBatches)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'product_id' })
    productId: string;

    @Column({ nullable: true })
    batchCode?: string; // Código único para el lote (puede ser un código de barras)

    @Column('decimal', { precision: 10, scale: 2 })
    totalCostBs: number; // Costo total del lote en bolívares

    @Column('decimal', { precision: 10, scale: 2 })
    totalCostUsd: number; // Costo total del lote en dólares

    @ManyToOne(() => ExchangeRate)
    @JoinColumn({ name: 'purchase_exchange_rate_id' })
    purchaseExchangeRate: ExchangeRate; // Tasa de cambio al momento de la compra

    @Column({ name: 'purchase_exchange_rate_id' })
    purchaseExchangeRateId: string;

    @Column()
    initialQuantity: number; // Cantidad inicial de unidades en el lote

    @Column()
    currentQuantity: number; // Cantidad actual de unidades en el lote

    @Column('decimal', { precision: 5, scale: 2 })
    profitPercentage: number; // Porcentaje de ganancia aplicado a este lote

    @Column('decimal', { precision: 10, scale: 2 })
    unitCostUsd: number; // Costo unitario en dólares

    @Column('decimal', { precision: 10, scale: 2 })
    unitCostBs: number; // Costo unitario en bolívares

    @Column('decimal', { precision: 10, scale: 2 })
    sellingPriceUsd: number; // Precio de venta en dólares

    @Column({ type: 'date' })
    purchaseDate: Date; // Fecha de compra del lote

    @Column({ nullable: true })
    expirationDate: Date; // Fecha de vencimiento (si aplica)

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
