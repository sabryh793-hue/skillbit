import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DBService } from '../abstract.repository'
import { ContestResult } from './contest.result.schema'


@Injectable()
export class ContestResultRepo extends DBService<ContestResult> {
  constructor(
    @InjectModel(ContestResult.name) private readonly contestResultModel: Model<ContestResult>
  ) {
    super(contestResultModel)
  }
}