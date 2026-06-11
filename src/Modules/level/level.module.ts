import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';
import { Level, LevelSchema } from 'src/Models/Levels/level.schema';
import { LevelRepo } from 'src/Models/Levels/level.repo';
import { TokenService } from 'src/common/services/token.service';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/common';
import { UserRepo } from 'src/Models/User/user.repo';
import { User, UserSchema } from 'src/Models/User/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Level.name, schema: LevelSchema },
      {name:User.name , schema : UserSchema}
    ]),
  ],
  controllers: [LevelController],
  providers: [
    LevelService,
    LevelRepo,
    UserRepo,
    TokenService,
    Reflector,
    JwtService,
  ],
  exports: [LevelService, LevelRepo],
})
export class LevelModule {}
