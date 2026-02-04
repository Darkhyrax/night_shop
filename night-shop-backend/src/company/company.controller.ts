import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CompanyConfig } from './company.entity';
import { UpdateCompanyConfigDto } from './dto/update-company-config.dto';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get('config')
  @ApiOperation({ summary: 'Obtener configuración', description: 'Obtiene la configuración de la empresa' })
  @ApiResponse({ status: 200, description: 'Configuración de la empresa' })
  async getConfig(): Promise<CompanyConfig> {
    return this.companyService.getConfig();
  }

  @Post('config')
  @ApiOperation({ summary: 'Actualizar configuración', description: 'Actualiza la configuración de la empresa' })
  @ApiBody({ type: UpdateCompanyConfigDto })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async updateConfig(
    @Body() dto: UpdateCompanyConfigDto,
  ): Promise<CompanyConfig> {
    return this.companyService.updateConfig(dto);
  }

  @Post('config/upload')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Subir logo', description: 'Sube el logo de la empresa' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (máximo 5MB)',
        },
        name: { type: 'string', description: 'Nombre de la empresa' },
        useImage: { type: 'boolean', description: 'Usar imagen como logo' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logo subido exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  async uploadLogo(
    @UploadedFile() file: any,
    @Body() body: { name: string; useImage: string },
  ): Promise<CompanyConfig> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    return this.companyService.updateConfig({
      name: body.name,
      useImage: body.useImage === 'true',
      logoData: file.buffer,
      logoMimeType: file.mimetype,
    });
  }

  @Post('config/reset')
  @ApiOperation({ summary: 'Resetear configuración', description: 'Restaura la configuración por defecto' })
  @ApiResponse({ status: 200, description: 'Configuración reseteada' })
  async resetConfig(): Promise<CompanyConfig> {
    return this.companyService.resetConfig();
  }
}
