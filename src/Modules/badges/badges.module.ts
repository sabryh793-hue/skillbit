import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { BadgeService } from './badges.service';
import { BadgeRepo } from 'src/Models/Badges/badge.repo';
import { Badge, BadgeSchema } from 'src/Models/Badges/badge.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/Models/User/user.schema';
import { UserRepo } from 'src/Models/User/user.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Badge.name, schema: BadgeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BadgesController],
  providers: [BadgeService, BadgeRepo, UserRepo],
})
export class BadgesModule {}
