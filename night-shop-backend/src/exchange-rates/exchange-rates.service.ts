import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async create(createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    // Si la nueva tasa es activa, desactivamos las demás
    if (createExchangeRateDto.isActive) {
      await this.deactivateAllRates();
    }

    const newRate = this.exchangeRateRepository.create(createExchangeRateDto);
    return this.exchangeRateRepository.save(newRate);
  }

  async findAll(): Promise<ExchangeRate[]> {
    return this.exchangeRateRepository.find({
      order: { effectiveDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepository.findOne({ where: { id } });
    if (!rate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }
    return rate;
  }

  async update(id: string, updateExchangeRateDto: UpdateExchangeRateDto): Promise<ExchangeRate> {
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
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }
  }

  async getCurrentRate(): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepository.findOne({
      where: { isActive: true },
    });
    
    if (!rate) {
      // Si no hay tasa activa, buscamos la más reciente
      const latestRate = await this.exchangeRateRepository.findOne({
        order: { effectiveDate: 'DESC' },
      });
      
      if (!latestRate) {
        throw new NotFoundException('No exchange rates found in the system');
      }
      
      return latestRate;
    }
    
    return rate;
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
      throw new NotFoundException(`No exchange rate found for date ${formattedDate}`);
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
}
