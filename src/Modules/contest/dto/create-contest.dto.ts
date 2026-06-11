import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateContestDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsEnum(['global', 'duel'])
  type: string

  @IsString()
  @IsNotEmpty()
  level: string

  @IsDate()
  @Type(() => Date)
  startTime: Date

  @IsNumber()
  duration: number // minutes

  @IsString()
  @IsOptional()
  challengerId?: string

  @IsString()
  @IsOptional()
  challengedId?: string
}