import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { UserRepo } from 'src/Models/User/user.repo';
import { TokenService } from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Enrollment, EnrollmentSchema } from 'src/Models/Enrollments/enrollment.schema';
import { EnrollmentRepo } from 'src/Models/Enrollments/enrollment.repo';
import { Course, CourseSchema } from 'src/Models/Cousrses/course.schema';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { LeaderboardRepo } from 'src/Models/Leaderboard/leaderboard.repo.';
import { ContestRepo } from 'src/Models/Contests/contest.repo';
import { ContestResultRepo } from 'src/Models/Contests/cotest.result.repo';
import { BadgeRepo } from 'src/Models/Badges/badge.repo';
import { Leaderboard, LeaderboardSchema } from 'src/Models/Leaderboard/leaderboard.schema';
import { Contest, ContestSchema } from 'src/Models/Contests/cotest.schema';
import { Badge, BadgeSchema } from 'src/Models/Badges/badge.schema';
import { ContestResult, ContestResultSchema } from 'src/Models/Contests/contest.result.schema';
import { Level, LevelSchema } from 'src/Models/Levels/level.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Leaderboard.name, schema: LeaderboardSchema },
      { name: Contest.name, schema: ContestSchema },
      { name: ContestResult.name, schema: ContestResultSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: Level.name, schema: LevelSchema },
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LevelRepo, UserRepo, TokenService, Reflector, JwtService, EnrollmentRepo , LeaderboardRepo , UserRepo , ContestRepo, ContestResultRepo, BadgeRepo],
})
export class LeaderboardModule { }