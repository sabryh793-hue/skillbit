import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SubmitContestDto {

  @IsString()
  @IsNotEmpty()
  contestId : string
  
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  answers: string[]

  @IsNumber()
  @IsOptional()
  timeTaken: number
}