import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional } from "class-validator";

export class SubmitContestDto {
  @IsArray()
  @ArrayMinSize(1)
  answers: string[]

  @IsNumber()
  @IsOptional()
  timeTaken: number
}