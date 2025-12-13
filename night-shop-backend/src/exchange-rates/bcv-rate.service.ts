import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import https from 'https';

interface BcvRateResult {
    rate: number;
    effectiveDate: Date;
}

@Injectable()
export class BcvRateService {
    private readonly logger = new Logger(BcvRateService.name);

    async fetchBcvRate(): Promise<BcvRateResult> {
        const url = process.env.BCV_RATE_URL || 'https://www.bcv.org.ve/';

        // Crear agente HTTPS que ignora certificados inválidos (solo para desarrollo)
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        try {
            const response = await axios.get(url, {
                httpAgent: undefined,
                httpsAgent,
                timeout: 10000,
            });

            const html = response.data as string;

            // Buscar el bloque donde aparece `<span> USD</span>` y luego el `<strong> 241,57800000 </strong>`
            const usdMatch = html.match(
                /<span>\s*USD\s*<\/span>[\s\S]*?<strong>\s*([0-9,.]+)\s*<\/strong>/i,
            );
            if (!usdMatch || !usdMatch[1]) {
                this.logger.error(
                    'No se pudo encontrar la tasa del USD en la página del BCV',
                );
                throw new Error(
                    'No se pudo encontrar la tasa del USD en la página del BCV',
                );
            }

            const raw = usdMatch[1].trim();
            const normalized = raw.replace(/\./g, '').replace(',', '.');
            const rate = Number(normalized);

            if (!Number.isFinite(rate)) {
                this.logger.error(`Tasa del BCV inválida: "${raw}"`);
                throw new Error(`Tasa del BCV inválida: "${raw}"`);
            }

            const effectiveDate = new Date();

            return { rate, effectiveDate };
        } catch (error) {
            this.logger.error(
                `Error al obtener tasa del BCV: ${(error as Error).message}`,
            );
            throw error;
        }
    }
}
