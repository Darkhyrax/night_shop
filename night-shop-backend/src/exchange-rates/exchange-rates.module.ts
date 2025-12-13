import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { ExchangeRateSyncLog } from './entities/exchange-rate-sync-log.entity';
import { BcvRateService } from './bcv-rate.service';
import { ExchangeRateSyncScheduler } from './exchange-rate-sync.scheduler';

@Module({
    imports: [TypeOrmModule.forFeature([ExchangeRate, ExchangeRateSyncLog])],
    controllers: [ExchangeRatesController],
    providers: [
        ExchangeRatesService,
        BcvRateService,
        ExchangeRateSyncScheduler,
    ],
    exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
