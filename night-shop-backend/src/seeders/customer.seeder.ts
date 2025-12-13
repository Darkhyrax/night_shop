import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class CustomerSeeder {
    private readonly logger = new Logger(CustomerSeeder.name);

    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) {}

    async seed(): Promise<void> {
        const customerCount = await this.customersRepository.count();

        if (customerCount === 0) {
            this.logger.log('Creando cliente de prueba...');

            const customer = this.customersRepository.create({
                firstName: 'Juan',
                lastName: 'Pérez',
                dni: '12345678',
                phone: '+58-412-1234567',
                isActive: true,
            });

            await this.customersRepository.save(customer);
            this.logger.log('Cliente de prueba creado exitosamente');
        } else {
            this.logger.log(
                'Ya existen clientes en la base de datos, omitiendo creación',
            );
        }
    }
}
