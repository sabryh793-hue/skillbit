import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional } from "class-validator";

export class SubmitContestDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  answers: number[]

  @IsNumber()
  @IsOptional()
  timeTaken: number
}