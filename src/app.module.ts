import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Modules/Auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './Modules/User/user.module';
import devConfig from './config/env/dev.config';
import { CourseModule } from './Modules/course/course.module';
import { LessonModule } from './Modules/lesson/lesson.module';
import { QuizModule } from './Modules/quiz/quiz.module';
import { ContestModule } from './Modules/contest/contest.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LevelModule } from './Modules/level/level.module';
import { AchievementModule } from './Modules/achievement/achievement.module';
import { LeaderboardModule } from './Modules/leaderboard/leaderboard.module';
import { BadgesModule } from './Modules/badges/badges.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),//for scheduling cron jobs
    ConfigModule.forRoot({//for loading environment variables
          load: [devConfig],
          isGlobal:true
    }),
    
   MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const uri = configService.getOrThrow<string>('DATABASE_URL');
    return { uri };
  },
}),

  //   MongooseModule.forFeature([
  //  {
  //   name: User.name,
  //   schema: UserSchema,
  //   // discriminators: [
  //   //   {
  //   //     name: "admin",
  //   //     schema: AdminSchema,
  //   //   }
  //   // ],
  //  }
  //   ]),
     AuthModule,
     UserModule,
     CourseModule,
     LessonModule,
     QuizModule,
     ContestModule,
     LevelModule,
     AchievementModule,
     LeaderboardModule,
     BadgesModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}