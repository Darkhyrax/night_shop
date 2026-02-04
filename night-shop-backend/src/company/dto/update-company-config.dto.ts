import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class UpdateCompanyConfigDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsBoolean()
  useImage: boolean;

  @IsOptional()
  logoData?: string | null;

  @IsOptional()
  @IsString()
  logoMimeType?: string | null;
}
