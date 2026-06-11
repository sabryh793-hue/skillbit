import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DBService } from '../abstract.repository'
import { Badge } from './badge.schema'


@Injectable()
export class BadgeRepo extends DBService<Badge> {
  constructor(
    @InjectModel(Badge.name) private readonly badgeModel: Model<Badge>
  ) {
    super(badgeModel)
  }
}