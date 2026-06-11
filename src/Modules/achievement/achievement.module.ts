import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementController } from './achievement.controller';
import { Achievement, AchievementSchema } from 'src/Models/Achievements/achievement.schema';
import { AchievementRepo } from 'src/Models/Achievements/achievement.repo';
import { UserRepo } from 'src/Models/User/user.repo';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { TokenService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { AchievementService } from './achievement.service';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema }
    ])
  ],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepo, UserRepo, TokenService, JwtService, EnrollmentRepo, CourseRepo],
})
export class AchievementModule { }
