import { IsArray, IsMongoId, IsNumber, IsOptional, ArrayMinSize, Min, IsString } from 'class-validator';

export class SubmitQuizDto {
  @IsMongoId()
  quizId: string;

  // Index-aligned with quiz.questions[]
  // answers[0] = chosen option index for questions[0]
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  answers: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeTaken: number; // seconds the user took to finish
}
