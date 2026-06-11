import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateLevelDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  earnScore?: number;
}
