import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];

  @IsNumber()
  @Min(0)
  correctAnswerIndex: number;

  @IsOptional()
  @IsString()
  correctAnswerHint?: string;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => UpdateQuestionDto)
  questions?: UpdateQuestionDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passingScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  earnedXp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeLimit?: number;
}
