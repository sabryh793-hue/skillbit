import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { Level, LevelSchema } from 'src/Models/Levels/level.schema';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { Lesson, LessonSchema } from 'src/Models/Lessons/lesson.schem';
import { LessonRepo } from 'src/Models/Lessons/lesson.repo';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { UserRepo } from 'src/Models/User/user.repo';
import { TokenService } from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';
import { Quiz, QuizSchema } from 'src/Models/Quizes/quiz,schema';
import { QuizRepo } from 'src/Models/Quizes/quiz.repo';
import { JwtService } from '@nestjs/jwt';
import { AchievementService } from '../achievement/achievement.service';
import { AchievementRepo } from 'src/Models/Achievements/achievement.repo';
import { Achievement, AchievementSchema } from 'src/Models/Achievements/achievement.schema';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Level.name, schema: LevelSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Achievement.name, schema: AchievementSchema }

    ]),
  ],
  controllers: [CourseController],
  providers: [
    CourseService,
    CourseRepo,
    LevelRepo,
    LessonRepo,
    EnrollmentRepo,
    UserRepo,
    TokenService,
    Reflector,
    QuizRepo,
    JwtService,
    AchievementService,
    AchievementRepo
  ],
  exports: [CourseService, CourseRepo, AchievementService],
})
export class CourseModule { }
