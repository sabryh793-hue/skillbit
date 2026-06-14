import { Type } from 'class-transformer';
import {IsString, IsNotEmpty, IsNumber, IsBoolean, Min, Max, IsEnum, IsArray, ValidateNested, IsOptional} from 'class-validator';
import { CourseType } from 'src/Models/Cousrses/course.schema';


export class CreateCourseDto {
  
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  level: number;

  @IsNumber()
  @Min(0)
  order: number;

  @IsEnum(CourseType)
  type: CourseType;

  @IsBoolean()
  isLocked: boolean;

  @IsBoolean()
  isTutorial: boolean;

  @IsNumber()
  @Min(0)
  earnScore: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  passScore: number;           // defaults to 70 in schema

  @IsString()
  @IsOptional()
  courseImage: string;
}


export class CreateBulkCoursesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseDto)
  courses: CreateCourseDto[]
}
