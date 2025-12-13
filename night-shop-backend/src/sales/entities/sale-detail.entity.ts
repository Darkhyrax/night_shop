import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../products/entities/product.entity';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';

@Entity('sale_details')
export class SaleDetail {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Sale, (sale) => sale.saleDetails)
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @Column({ name: 'sale_id' })
    saleId: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'product_id' })
    productId: string;

    @ManyToOne(() => InventoryBatch, { nullable: true })
    @JoinColumn({ name: 'inventory_batch_id' })
    inventoryBatch: InventoryBatch;

    @Column({ name: 'inventory_batch_id', nullable: true })
    inventoryBatchId: string;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPriceBs: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPriceUsd: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotalBs: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotalUsd: number;
}
