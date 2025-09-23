import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    findAll(): Promise<Customer[]> {
        return this.customersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Customer> {
        return this.customersService.findOne(id);
    }

    @Get('dni/:dni')
    findByDni(@Param('dni') dni: string): Promise<Customer> {
        return this.customersService.findByDni(dni);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(id);
    }
}
