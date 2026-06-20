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

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];

  @IsNumber()
  @Min(0)
  correctAnswerIndex: number; // index into options[]

  @IsOptional()
  @IsString()
  correctAnswerHint?: string;
}



export class CreateQuizDto {

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsOptional()
  @IsMongoId()
  lessonId?: string; // omit for a final-course quiz

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passingScore: number; // default 70 in schema

  @IsNumber()
  @Min(0)
  earnedXp: number;

  @IsNumber()
  @Min(0)
  timeLimit: number; // in seconds, 0 = no limit

  @IsNumber()
  @Min(0)
  easy_count: number;

  @IsNumber()
  @Min(0)
  medium_count: number;

  @IsNumber()
  @Min(0)
  hard_count: number;

}