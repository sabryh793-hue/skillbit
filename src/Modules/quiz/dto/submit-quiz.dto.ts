import { IsArray, IsMongoId, IsNumber, IsOptional, ArrayMinSize, Min } from 'class-validator';

export class SubmitQuizDto {
  @IsMongoId()
  quizId: string;

  // Index-aligned with quiz.questions[]
  // answers[0] = chosen option index for questions[0]
  @IsArray()
  @IsNumber({}, { each: true })//means each element in the array should be a number .
  @Min(0, { each: true })
  @ArrayMinSize(1)
  answers: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeTaken?: number; // seconds the user took to finish
}
