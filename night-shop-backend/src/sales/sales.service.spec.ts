import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { CustomersService } from '../customers/customers.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';

describe('SalesService', () => {
    let service: SalesService;

    const mockSaleRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };

    const mockSaleDetailRepository = {
        find: jest.fn(),
        save: jest.fn(),
    };

    const mockCustomerPaymentRepository = {
        find: jest.fn(),
    };

    const mockCustomerAccountRepository = {
        find: jest.fn(),
    };

    const mockUsersService = {
        findOne: jest.fn(),
    };

    const mockProductsService = {
        findOne: jest.fn(),
    };

    const mockInventoryService = {
        findBatchesByProduct: jest.fn(),
    };

    const mockCustomersService = {
        findOne: jest.fn(),
    };

    const mockExchangeRatesService = {
        getCurrentRate: jest.fn(),
    };

    const mockDataSource = {
        transaction: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesService,
                {
                    provide: getRepositoryToken(Sale),
                    useValue: mockSaleRepository,
                },
                {
                    provide: 'SaleDetailRepository',
                    useValue: mockSaleDetailRepository,
                },
                {
                    provide: 'CustomerPaymentRepository',
                    useValue: mockCustomerPaymentRepository,
                },
                {
                    provide: 'CustomerAccountRepository',
                    useValue: mockCustomerAccountRepository,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
                {
                    provide: InventoryService,
                    useValue: mockInventoryService,
                },
                {
                    provide: CustomersService,
                    useValue: mockCustomersService,
                },
                {
                    provide: ExchangeRatesService,
                    useValue: mockExchangeRatesService,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<SalesService>(SalesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
