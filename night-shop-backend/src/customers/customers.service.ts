import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Verificar si ya existe un cliente con el mismo DNI
    const existingCustomer = await this.customersRepository.findOne({
      where: { dni: createCustomerDto.dni }
    });

    if (existingCustomer) {
      throw new ConflictException(`Ya existe un cliente con el DNI ${createCustomerDto.dni}`);
    }

    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({
      where: { isActive: true },
      order: { lastName: 'ASC', firstName: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id }
    });
    
    if (!customer) {
      throw new NotFoundException(`Cliente con ID "${id}" no encontrado`);
    }
    
    return customer;
  }

  async findByDni(dni: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { dni }
    });
    
    if (!customer) {
      throw new NotFoundException(`Cliente con DNI "${dni}" no encontrado`);
    }
    
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    // Si se está actualizando el DNI, verificar que no exista otro cliente con ese DNI
    if (updateCustomerDto.dni && updateCustomerDto.dni !== customer.dni) {
      const existingCustomer = await this.customersRepository.findOne({
        where: { dni: updateCustomerDto.dni }
      });

      if (existingCustomer) {
        throw new ConflictException(`Ya existe un cliente con el DNI ${updateCustomerDto.dni}`);
      }
    }
    
    Object.assign(customer, updateCustomerDto);
    
    return this.customersRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    customer.isActive = false;
    await this.customersRepository.save(customer);
  }
}
