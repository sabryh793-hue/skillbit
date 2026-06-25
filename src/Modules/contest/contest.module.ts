import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { AuthController } from '../Auth/auth.controller';
import { AuthService } from '../Auth/auth.service';
import { UserRepo } from 'src/Models/User/user.repo';
import { ContestResultRepo } from 'src/Models/Contests/cotest.result.repo';
import { DuelRequestRepo } from 'src/Models/Contests/duel.request.repo';
import { ContestRepo } from 'src/Models/Contests/contest.repo';
import { TokenService } from 'src/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { Contest, ContestSchema } from 'src/Models/Contests/cotest.schema';
import { ContestResult, ContestResultSchema } from 'src/Models/Contests/contest.result.schema';
import { DuelRequest, DuelRequestSchema } from 'src/Models/Contests/duel.request.schema';
import { Achievement, AchievementSchema } from 'src/Models/Achievements/achievement.schema';
import { AchievementService } from '../achievement/achievement.service';
import { AchievementRepo } from 'src/Models/Achievements/achievement.repo';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { CourseRepo } from 'src/Models/Cousrses/course.repo';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { LeaderboardRepo } from 'src/Models/Leaderboard/leaderboard.repo.';
import { LeaderboardController } from '../leaderboard/leaderboard.controller';
import { BadgeRepo } from 'src/Models/Badges/badge.repo';
import { Leaderboard, LeaderboardSchema } from 'src/Models/Leaderboard/leaderboard.schema';
import { Badge, BadgeSchema } from 'src/Models/Badges/badge.schema';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env file and make it available globally
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: ContestResult.name, schema: ContestResultSchema },
      { name: DuelRequest.name, schema: DuelRequestSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Leaderboard.name, schema: LeaderboardSchema },
      { name: Badge.name, schema: BadgeSchema },
    ]),
  ],
  controllers: [ContestController,AuthController,LeaderboardController],
  providers: [ContestService,AuthService,ContestRepo,UserRepo,ContestResultRepo,DuelRequestRepo,TokenService,JwtService,AchievementService,AchievementRepo,EnrollmentRepo,CourseRepo,LeaderboardService,LeaderboardRepo,BadgeRepo],
})
export class ContestModule {}
