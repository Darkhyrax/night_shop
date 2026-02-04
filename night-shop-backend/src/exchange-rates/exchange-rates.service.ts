import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { ExchangeRateSyncLog } from './entities/exchange-rate-sync-log.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
    private cachedRate: ExchangeRate | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos
    private currentRateType: 'BCV' | 'CUSTOM' = 'BCV'; // Tipo de tasa activa

    constructor(
        @InjectRepository(ExchangeRate)
        private exchangeRateRepository: Repository<ExchangeRate>,
        @InjectRepository(ExchangeRateSyncLog)
        private syncLogRepository: Repository<ExchangeRateSyncLog>,
    ) {}

    // Obtener tipo de tasa activa
    getCurrentRateType(): 'BCV' | 'CUSTOM' {
        return this.currentRateType;
    }

    // Cambiar tipo de tasa activa
    setCurrentRateType(rateType: 'BCV' | 'CUSTOM'): void {
        this.currentRateType = rateType;
    }

    // Método para invalidar el caché
    clearCache(): void {
        this.cachedRate = null;
        this.cacheTimestamp = 0;
    }

    async create(
        createExchangeRateDto: CreateExchangeRateDto,
    ): Promise<ExchangeRate> {
        // Si la nueva tasa es activa, desactivamos las demás
        if (createExchangeRateDto.isActive) {
            await this.deactivateAllRates();
        }

        const newRate = this.exchangeRateRepository.create(
            createExchangeRateDto,
        );
        return this.exchangeRateRepository.save(newRate);
    }

    async findAll(): Promise<ExchangeRate[]> {
        return this.exchangeRateRepository.find({
            order: { effectiveDate: 'DESC' },
        });
    }

    async findOne(id: string): Promise<ExchangeRate> {
        const rate = await this.exchangeRateRepository.findOne({
            where: { id },
        });
        if (!rate) {
            throw new NotFoundException(
                `Exchange rate with ID ${id} not found`,
            );
        }
        return rate;
    }

    async update(
        id: string,
        updateExchangeRateDto: UpdateExchangeRateDto,
    ): Promise<ExchangeRate> {
        // Si estamos activando esta tasa, desactivamos las demás
        if (updateExchangeRateDto.isActive) {
            await this.deactivateAllRates();
        }

        const rate = await this.findOne(id);
        Object.assign(rate, updateExchangeRateDto);
        return this.exchangeRateRepository.save(rate);
    }

    async remove(id: string): Promise<void> {
        const result = await this.exchangeRateRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(
                `Exchange rate with ID ${id} not found`,
            );
        }
    }

    async getCurrentRate(): Promise<ExchangeRate> {
        // Verificar si el caché es válido
        const now = Date.now();
        if (
            this.cachedRate &&
            now - this.cacheTimestamp < this.CACHE_DURATION_MS
        ) {
            return this.cachedRate;
        }

        // Obtener tasa activa del tipo configurado
        const rate = await this.exchangeRateRepository.findOne({
            where: { isActive: true, rateType: this.currentRateType },
            order: { effectiveDate: 'DESC' },
        });

        if (rate) {
            // Guardar en caché
            this.cachedRate = rate;
            this.cacheTimestamp = now;
            return rate;
        }

        // Si no hay tasa activa del tipo configurado, buscamos la más reciente del mismo tipo
        const [latestRate] = await this.exchangeRateRepository.find({
            where: { rateType: this.currentRateType },
            order: { effectiveDate: 'DESC' },
            take: 1,
        });

        if (!latestRate) {
            throw new NotFoundException(
                `No exchange rates found for type ${this.currentRateType}`,
            );
        }

        // Guardar en caché
        this.cachedRate = latestRate;
        this.cacheTimestamp = now;
        return latestRate;
    }

    // Obtener tasa activa por tipo específico
    async getRateByType(rateType: 'BCV' | 'CUSTOM'): Promise<ExchangeRate> {
        const rate = await this.exchangeRateRepository.findOne({
            where: { isActive: true, rateType },
            order: { effectiveDate: 'DESC' },
        });

        if (rate) {
            return rate;
        }

        // Si no hay tasa activa, obtener la más reciente del tipo
        const [latestRate] = await this.exchangeRateRepository.find({
            where: { rateType },
            order: { effectiveDate: 'DESC' },
            take: 1,
        });

        if (!latestRate) {
            throw new NotFoundException(
                `No exchange rates found for type ${rateType}`,
            );
        }

        return latestRate;
    }

    // Obtener todas las tasas disponibles (BCV y CUSTOM)
    async getAvailableRates(): Promise<{
        bcv: ExchangeRate | null;
        custom: ExchangeRate | null;
    }> {
        const bcv = await this.exchangeRateRepository.findOne({
            where: { isActive: true, rateType: 'BCV' },
            order: { effectiveDate: 'DESC' },
        });

        const custom = await this.exchangeRateRepository.findOne({
            where: { isActive: true, rateType: 'CUSTOM' },
            order: { effectiveDate: 'DESC' },
        });

        return { bcv, custom };
    }

    // Obtener la última tasa BCV guardada (activa o no)
    async getLatestBcvRate(): Promise<ExchangeRate | null> {
        return this.exchangeRateRepository.findOne({
            where: { rateType: 'BCV' },
            order: { effectiveDate: 'DESC' },
        });
    }

    async getRateByDate(date: Date): Promise<ExchangeRate> {
        // Buscamos la tasa válida para la fecha especificada
        // (la más cercana anterior o igual a la fecha dada)
        const formattedDate = date.toISOString().split('T')[0];

        const rate = await this.exchangeRateRepository
            .createQueryBuilder('rate')
            .where('rate.effectiveDate <= :date', { date: formattedDate })
            .orderBy('rate.effectiveDate', 'DESC')
            .getOne();

        if (!rate) {
            throw new NotFoundException(
                `No exchange rate found for date ${formattedDate}`,
            );
        }

        return rate;
    }

    private async deactivateAllRates(): Promise<void> {
        await this.exchangeRateRepository
            .createQueryBuilder()
            .update()
            .set({ isActive: false })
            .execute();
    }

    // Método para convertir USD a Bs usando la tasa actual
    async convertUsdToBs(amountUsd: number): Promise<number> {
        const currentRate = await this.getCurrentRate();
        return amountUsd * currentRate.rate;
    }

    // Método para convertir USD a Bs usando una tasa histórica
    async convertUsdToBsByDate(amountUsd: number, date: Date): Promise<number> {
        const historicalRate = await this.getRateByDate(date);
        return amountUsd * historicalRate.rate;
    }

    // Registrar intento de sincronización exitoso
    async logSuccessfulSync(
        rate: number,
        source: string = 'BCV',
    ): Promise<ExchangeRateSyncLog> {
        const log = this.syncLogRepository.create({
            success: true,
            rate,
            source,
            errorMessage: null,
        });
        return this.syncLogRepository.save(log);
    }

    // Registrar intento de sincronización fallido
    async logFailedSync(
        errorMessage: string,
        source: string = 'BCV',
    ): Promise<ExchangeRateSyncLog> {
        const log = this.syncLogRepository.create({
            success: false,
            rate: null,
            source,
            errorMessage,
        });
        return this.syncLogRepository.save(log);
    }

    // Obtener estado de sincronización
    async getSyncStatus() {
        const [lastSync] = await this.syncLogRepository.find({
            order: { syncedAt: 'DESC' },
            take: 1,
        });

        if (!lastSync) {
            return {
                lastSync: null,
                success: null,
                errorMessage: null,
                rate: null,
                syncedAt: null,
            };
        }

        return {
            lastSync,
            success: lastSync.success,
            errorMessage: lastSync.errorMessage,
            rate: lastSync.rate,
            syncedAt: lastSync.syncedAt,
        };
    }

    // Obtener últimos 5 intentos de sincronización
    async getSyncHistory(limit: number = 5) {
        return this.syncLogRepository.find({
            order: { syncedAt: 'DESC' },
            take: limit,
        });
    }
}
