import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { Lesson, LessonSchema } from 'src/Models/Lessons/lesson.schem';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { UserRepo } from 'src/Models/User/user.repo';
import { TokenService } from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';
import { Quiz, QuizSchema } from 'src/Models/Quizes/quiz,schema';
import { QuizRepo } from 'src/Models/Quizes/quiz.repo';
import { JwtService } from '@nestjs/jwt';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      {name:Quiz.name,schema:QuizSchema}
    ]),
  ],
  controllers: [LessonController],
  providers: [LessonService, LessonRepo, CourseRepo, UserRepo, TokenService, Reflector, QuizRepo, JwtService, EnrollmentRepo,QuizRepo],
  exports: [LessonService, LessonRepo],
})
export class LessonModule { }
