import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { BadgeService } from './badges.service';
import { BadgeRepo } from 'src/Models/Badges/badge.repo';
import { Badge, BadgeSchema } from 'src/Models/Badges/badge.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Badge.name, schema: BadgeSchema }])],
  controllers: [BadgesController],
  providers: [BadgeService, BadgeRepo],
})
export class BadgesModule {}
