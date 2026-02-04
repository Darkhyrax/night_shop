import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { BcvRateService } from './bcv-rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';

@Injectable()
export class ExchangeRateSyncScheduler implements OnModuleInit {
    private readonly logger = new Logger(ExchangeRateSyncScheduler.name);
    private syncInterval: NodeJS.Timeout;

    constructor(
        private readonly exchangeRatesService: ExchangeRatesService,
        private readonly bcvRateService: BcvRateService,
    ) {}

    onModuleInit() {
        this.logger.log(
            'Inicializando scheduler de sincronización de tasas de cambio',
        );
        this.scheduleDailySync();
    }

    private scheduleDailySync() {
        const now = new Date();
        const nextSync = new Date(now);
        nextSync.setHours(16, 0, 0, 0);

        // Si ya pasó las 4 PM hoy, programar para mañana a las 4 PM
        if (now.getTime() >= nextSync.getTime()) {
            nextSync.setDate(nextSync.getDate() + 1);
        }

        const timeUntilSync = nextSync.getTime() - now.getTime();

        this.syncInterval = setTimeout(() => {
            void this.syncExchangeRateDaily();
            this.syncInterval = setInterval(
                () => {
                    void this.syncExchangeRateDaily();
                },
                24 * 60 * 60 * 1000,
            );
        }, timeUntilSync);

        this.logger.log(
            `Próxima sincronización programada para: ${nextSync.toISOString()}`,
        );
    }

    async syncExchangeRateDaily() {
        // Solo sincronizar si el tipo de tasa activa es BCV
        const currentRateType = this.exchangeRatesService.getCurrentRateType();
        if (currentRateType === 'CUSTOM') {
            this.logger.log(
                'Sincronización automática pausada: Tasa personalizada activa',
            );
            return;
        }

        this.logger.log(
            'Iniciando sincronización diaria de tasa de cambio BCV...',
        );
        try {
            const { rate, effectiveDate } =
                await this.bcvRateService.fetchBcvRate();

            const dto: CreateExchangeRateDto = {
                rate,
                effectiveDate,
                isActive: true,
                source: 'BCV',
                notes: 'Importada automáticamente desde BCV (tarea programada)',
                rateType: 'BCV',
            };

            await this.exchangeRatesService.create(dto);
            await this.exchangeRatesService.logSuccessfulSync(rate, 'BCV');
            // Invalidar caché para forzar obtener la tasa actualizada
            this.exchangeRatesService.clearCache();
            this.logger.log(`Sincronización exitosa. Nueva tasa: ${rate}`);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Error desconocido';
            await this.exchangeRatesService.logFailedSync(errorMessage, 'BCV');
            this.logger.error(
                `Error en sincronización de tasa de cambio: ${errorMessage}`,
                error instanceof Error ? error.stack : '',
            );
        }
    }

    onModuleDestroy() {
        if (this.syncInterval) {
            clearTimeout(this.syncInterval);
        }
    }
}
