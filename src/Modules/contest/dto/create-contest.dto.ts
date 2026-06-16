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

  @IsString()
  @IsNotEmpty()
  topic: string

  @IsString()
  @IsNotEmpty()
  difficulty: string

  @IsDate()
  @Type(() => Date)
  startTime: Date //like 2026-08-05T17:00:00.000Z

  @IsNumber()
  duration: number // minutes

  @IsString()
  @IsOptional()
  challengerId?: string

  @IsString()
  @IsOptional()
  challengedId?: string
}