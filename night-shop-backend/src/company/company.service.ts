import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyConfig } from './company.entity';
import { UpdateCompanyConfigDto } from './dto/update-company-config.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyConfig)
    private companyRepository: Repository<CompanyConfig>,
  ) {}

  async getConfig(): Promise<any> {
    let config = await this.companyRepository.findOne({ where: {} });

    if (!config) {
      config = this.companyRepository.create({
        name: 'Night Shop',
        useImage: false,
        logoData: null,
        logoMimeType: null,
      });
      await this.companyRepository.save(config);
    }

    return this.convertLogoToBase64(config);
  }

  private convertLogoToBase64(config: CompanyConfig): any {
    return config;
  }

  async updateConfig(dto: UpdateCompanyConfigDto): Promise<any> {
    let config = await this.companyRepository.findOne({ where: {} });

    if (!config) {
      config = this.companyRepository.create(dto);
    } else {
      config.name = dto.name;
      config.useImage = dto.useImage;
      if (dto.logoData !== undefined) {
        config.logoData = dto.logoData;
      }
      if (dto.logoMimeType !== undefined) {
        config.logoMimeType = dto.logoMimeType;
      }
    }

    const saved = await this.companyRepository.save(config);
    return this.convertLogoToBase64(saved);
  }

  async resetConfig(): Promise<any> {
    await this.companyRepository.delete({});
    const config = this.companyRepository.create({
      name: 'Night Shop',
      useImage: false,
      logoData: null,
      logoMimeType: null,
    });
    const saved = await this.companyRepository.save(config);
    return this.convertLogoToBase64(saved);
  }
}
