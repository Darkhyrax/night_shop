import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { BcvRateService } from './bcv-rate.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
    constructor(
        private readonly exchangeRatesService: ExchangeRatesService,
        private readonly bcvRateService: BcvRateService,
    ) {}

    @Post()
    create(@Body() createExchangeRateDto: CreateExchangeRateDto) {
        return this.exchangeRatesService.create(createExchangeRateDto);
    }

    @Post('sync-bcv')
    async syncFromBcv() {
        try {
            const { rate, effectiveDate } =
                await this.bcvRateService.fetchBcvRate();

            const dto: CreateExchangeRateDto = {
                rate,
                effectiveDate,
                isActive: true,
                source: 'BCV',
                notes: 'Importada automáticamente desde BCV',
            };

            const result = await this.exchangeRatesService.create(dto);
            await this.exchangeRatesService.logSuccessfulSync(rate, 'BCV');
            return result;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Error desconocido al sincronizar';
            await this.exchangeRatesService.logFailedSync(errorMessage, 'BCV');
            throw error;
        }
    }

    @Get()
    findAll() {
        return this.exchangeRatesService.findAll();
    }

    @Get('sync-status')
    getSyncStatus() {
        return this.exchangeRatesService.getSyncStatus();
    }

    @Get('sync-history')
    getSyncHistory(@Query('limit') limit?: number) {
        return this.exchangeRatesService.getSyncHistory(limit || 5);
    }

    @Get('current')
    getCurrentRate() {
        return this.exchangeRatesService.getCurrentRate();
    }

    @Get('by-date')
    getRateByDate(@Query('date') dateString: string) {
        const date = new Date(dateString);
        return this.exchangeRatesService.getRateByDate(date);
    }

    @Get('convert')
    async convertUsdToBs(
        @Query('amount') amount: number,
        @Query('date') dateString?: string,
    ) {
        if (dateString) {
            const date = new Date(dateString);
            const bsAmount =
                await this.exchangeRatesService.convertUsdToBsByDate(
                    amount,
                    date,
                );
            return { usd: amount, bs: bsAmount, date: dateString };
        } else {
            const bsAmount =
                await this.exchangeRatesService.convertUsdToBs(amount);
            const currentRate =
                await this.exchangeRatesService.getCurrentRate();
            return {
                usd: amount,
                bs: bsAmount,
                date: currentRate.effectiveDate,
            };
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.exchangeRatesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateExchangeRateDto: UpdateExchangeRateDto,
    ) {
        return this.exchangeRatesService.update(id, updateExchangeRateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.exchangeRatesService.remove(id);
    }
}
