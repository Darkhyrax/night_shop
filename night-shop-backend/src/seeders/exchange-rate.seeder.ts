import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ExchangeRate } from '../exchange-rates/entities/exchange-rate.entity';

@Injectable()
export class ExchangeRateSeeder {
    constructor(
        @InjectRepository(ExchangeRate)
        private exchangeRateRepository: Repository<ExchangeRate>,
        private httpService: HttpService,
        private configService: ConfigService,
    ) {}

    async seed(): Promise<void> {
        // Verificar si hay algún registro de tasa de cambio
        const existingRates = await this.exchangeRateRepository.find({
            order: { createdAt: 'DESC' },
            take: 1,
        });

        // Si ya hay registros, no hacer nada
        if (existingRates.length > 0) {
            console.log(
                `✅ Tasa de cambio ya existe: 1 USD = ${existingRates[0].rate} Bs`,
            );
            return;
        }

        // Si no hay registros, crear la tasa por defecto
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rate = 256;
        const source = 'Sistema';

        const exchangeRate = this.exchangeRateRepository.create({
            rate,
            effectiveDate: today,
            isActive: true,
            source,
            notes: `Tasa de cambio por defecto del ${today.toLocaleDateString('es-ES')}`,
        });

        await this.exchangeRateRepository.save(exchangeRate);
        console.log(`✅ Tasa de cambio por defecto creada: 1 USD = ${exchangeRate.rate} Bs (${source})`);
    }

    private async fetchExchangeRate(): Promise<number> {
        const exchangeRateUrl = this.configService.get<string>('EXCHANGE_RATE_URL');

        if (!exchangeRateUrl) {
            return 256.5; // Retornar valor por defecto sin lanzar error
        }

        try {
            const response = await this.httpService.get(exchangeRateUrl).toPromise();
            if (!response) {
                return 256.5;
            }
            const rate = this.parseExchangeRate(response.data);
            console.log(`📊 Tasa obtenida del endpoint: 1 USD = ${rate} Bs`);
            return rate;
        } catch (error) {
            return 256.5; // Retornar valor por defecto si hay error
        }
    }

    private parseExchangeRate(data: any): number {
        // Adapta esto según la estructura de respuesta de tu API
        // Ejemplos comunes:
        if (data.rate) return parseFloat(data.rate);
        if (data.usd) return parseFloat(data.usd);
        if (data.USD) return parseFloat(data.USD);
        if (data.value) return parseFloat(data.value);
        if (Array.isArray(data) && data[0]?.rate) return parseFloat(data[0].rate);

        throw new Error('No se pudo extraer la tasa de cambio de la respuesta');
    }
}
