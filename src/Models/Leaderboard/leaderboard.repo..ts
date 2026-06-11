import { Injectable } from '@nestjs/common';
import { DBService } from '../abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leaderboard } from './leaderboard.schema';


@Injectable()
export class LeaderboardRepo extends DBService<Leaderboard> {
  constructor(@InjectModel(Leaderboard.name) private LeaderboardModel: Model<Leaderboard>) {
    
    super(LeaderboardModel);
  }
}
