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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    @ApiOperation({ summary: 'Crear cliente', description: 'Crea un nuevo cliente en el sistema' })
    @ApiBody({ type: CreateCustomerDto })
    @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 409, description: 'Cliente con ese DNI ya existe' })
    create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar clientes', description: 'Obtiene la lista de todos los clientes activos' })
    @ApiResponse({ status: 200, description: 'Lista de clientes' })
    findAll(): Promise<Customer[]> {
        return this.customersService.findAll();
    }

    @Get('dni/:dni')
    @ApiOperation({ summary: 'Buscar cliente por DNI', description: 'Obtiene un cliente usando su DNI' })
    @ApiParam({ name: 'dni', description: 'DNI del cliente' })
    @ApiResponse({ status: 200, description: 'Cliente encontrado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    findByDni(@Param('dni') dni: string): Promise<Customer> {
        return this.customersService.findByDni(dni);
    }

    @Get(':id/debts')
    @ApiOperation({ summary: 'Obtener deudas del cliente', description: 'Obtiene todas las deudas pendientes de un cliente' })
    @ApiParam({ name: 'id', description: 'ID del cliente' })
    @ApiResponse({ status: 200, description: 'Deudas del cliente' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    getCustomerDebts(@Param('id') id: string): Promise<any> {
        return this.customersService.getCustomerDebts(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener cliente', description: 'Obtiene los datos de un cliente específico' })
    @ApiParam({ name: 'id', description: 'ID del cliente' })
    @ApiResponse({ status: 200, description: 'Datos del cliente' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    findOne(@Param('id') id: string): Promise<Customer> {
        return this.customersService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar cliente', description: 'Actualiza los datos de un cliente' })
    @ApiParam({ name: 'id', description: 'ID del cliente' })
    @ApiBody({ type: UpdateCustomerDto })
    @ApiResponse({ status: 200, description: 'Cliente actualizado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    update(
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<Customer> {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar cliente', description: 'Desactiva un cliente (soft delete)' })
    @ApiParam({ name: 'id', description: 'ID del cliente' })
    @ApiResponse({ status: 200, description: 'Cliente eliminado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
    remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(id);
    }

    @Post(':id/payments')
    @ApiOperation({ summary: 'Registrar pago', description: 'Registra un pago o abono a las deudas del cliente' })
    @ApiParam({ name: 'id', description: 'ID del cliente' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amountUsd: { type: 'number', example: 10.5 },
                amountBs: { type: 'number', example: 5000 },
                exchangeRateId: { type: 'string', example: 'uuid-opcional' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Pago registrado' })
    @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
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
