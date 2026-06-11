import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DBService } from '../abstract.repository'
import { DuelRequest } from './duel.request.schema'


@Injectable()
export class DuelRequestRepo extends DBService<DuelRequest> {
  constructor(
    @InjectModel(DuelRequest.name) private readonly duelRequestModel: Model<DuelRequest>
  ) {
    super(duelRequestModel)
  }
}