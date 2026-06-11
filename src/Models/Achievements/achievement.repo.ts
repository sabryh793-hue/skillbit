import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { DBService } from 'src/Models/abstract.repository'
import { Achievement } from './achievement.schema'

@Injectable()
export class AchievementRepo extends DBService<Achievement> {
  constructor(@InjectModel(Achievement.name) private achievementModel: Model<Achievement>) {
    super(achievementModel)
  }
}