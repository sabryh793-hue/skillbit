import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateLevelDto {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  order: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  earnScore: number;
}
