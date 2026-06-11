import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DBService } from '../abstract.repository'
import { Contest } from './cotest.schema'


@Injectable()
export class ContestRepo extends DBService<Contest> {
  constructor(
    @InjectModel(Contest.name) private readonly contestModel: Model<Contest>
  ) {
    super(contestModel)
  }
}