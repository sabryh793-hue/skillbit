import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { Quiz, QuizSchema } from 'src/Models/Quizes/quiz,schema';
import { QuizRepo } from 'src/Models/Quizes/quiz.repo';
import { QuizAttempt, QuizAttemptSchema } from 'src/Models/Quizes/quizAttempt.schema';
import { QuizAttemptRepo } from 'src/Models/Quizes/quizAttempt.repo';
import { Lesson, LessonSchema } from 'src/Models/Lessons/lesson.schem';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { Level, LevelSchema } from 'src/Models/Levels/level.schema';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { UserRepo } from 'src/Models/User/user.repo';
import { TokenService } from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Level.name, schema: LevelSchema },
      { name: User.name, schema: UserSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [
    QuizService,
    QuizRepo,
    QuizAttemptRepo,
    LessonRepo,
    CourseRepo,
    LevelRepo,
    UserRepo,
    TokenService,
    Reflector,
    EnrollmentRepo,
    JwtService
  ],
  exports: [QuizService, QuizRepo, QuizAttemptRepo],
})
export class QuizModule { }
