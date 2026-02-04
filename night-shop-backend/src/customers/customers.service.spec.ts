import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

describe('CustomersService', () => {
    let service: CustomersService;

    const mockCustomerRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    };

    const mockCustomerAccountRepository = {
        find: jest.fn(),
        save: jest.fn(),
    };

    const mockCustomerPaymentRepository = {
        find: jest.fn(),
        save: jest.fn(),
    };

    const mockSaleRepository = {
        find: jest.fn(),
    };

    const mockExchangeRateRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CustomersService,
                {
                    provide: getRepositoryToken(Customer),
                    useValue: mockCustomerRepository,
                },
                {
                    provide: 'CustomerAccountRepository',
                    useValue: mockCustomerAccountRepository,
                },
                {
                    provide: 'CustomerPaymentRepository',
                    useValue: mockCustomerPaymentRepository,
                },
                {
                    provide: 'SaleRepository',
                    useValue: mockSaleRepository,
                },
                {
                    provide: 'ExchangeRateRepository',
                    useValue: mockExchangeRateRepository,
                },
            ],
        }).compile();

        service = module.get<CustomersService>(CustomersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
