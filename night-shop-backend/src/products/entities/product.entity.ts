import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { InventoryBatch } from '../../inventory/entities/inventory-batch.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    currentCostPrice: number; // Costo unitario del último lote

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    currentProfitPercentage: number; // Porcentaje de ganancia actual

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    currentSellingPrice: number; // Precio de venta actual

    @Column({ default: 0 })
    totalStock: number; // Stock total sumando todos los lotes

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => InventoryBatch, (batch) => batch.product)
    inventoryBatches: InventoryBatch[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
