import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose  from 'mongoose';

@Schema()
export class Leaderboard  {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ type: Number, default: 0 })
  contestRank: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: null })
  badgeId: mongoose.Schema.Types.ObjectId;

}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);