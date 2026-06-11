import { IsString, IsNumber, IsOptional, Min, Max, IsArray, IsBoolean } from 'class-validator';

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  materials?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passScore?: number;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;           
}