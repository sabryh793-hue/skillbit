import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class SubmitContestDto {
  @IsArray()
  @IsString({}, { each: true })
  @ArrayMinSize(1)
  answers: string[]

  @IsNumber()
  @IsOptional()
  timeTaken: number
}