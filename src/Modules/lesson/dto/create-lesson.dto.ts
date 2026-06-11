import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsMongoId, IsOptional, Min, Max, IsArray, ValidateNested } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  course: string;

  @IsNumber()
  @Min(1)
  order: number;

  @IsArray()
  @IsOptional()
  materials?: string[];          
}

export class CreateBulkLessonsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[]
}