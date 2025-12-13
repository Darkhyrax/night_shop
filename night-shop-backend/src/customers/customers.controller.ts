import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    findAll(): Promise<Customer[]> {
        return this.customersService.findAll();
    }

    @Get('dni/:dni')
    findByDni(@Param('dni') dni: string): Promise<Customer> {
        return this.customersService.findByDni(dni);
    }

    @Get(':id/debts')
    getCustomerDebts(@Param('id') id: string): Promise<any> {
        return this.customersService.getCustomerDebts(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Customer> {
        return this.customersService.findOne(id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<Customer> {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(id);
    }

    @Post(':id/payments')
    addPaymentToDebts(
        @Param('id') id: string,
        @Body() paymentDto: { amountUsd: number; amountBs: number; exchangeRateId?: number },
    ): Promise<any> {
        return this.customersService.addPaymentToCustomerDebts(
            id,
            paymentDto.amountUsd,
            paymentDto.amountBs,
            paymentDto.exchangeRateId,
        );
    }
}
