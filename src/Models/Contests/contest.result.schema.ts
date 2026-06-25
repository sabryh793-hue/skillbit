import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../User/user.schema';
import { Contest } from './cotest.schema';

@Schema({ timestamps: true })
export class ContestResult {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Contest.name, required: true })
  contestId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  correctCount: number;

  @Prop({ type: Number, default: 0 })
  score: number; // %
  
  @Prop({ type: Number, default: 0 }) 
  rank: number;

  @Prop({ type: Number, default: 0 })
  timeTaken: number; // seconds

  @Prop({ type: Number, default: 0 })
  xpEarned: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Badge', default: null })
  badgeEarned: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  answers: string[]; // user's answers

}

export const ContestResultSchema = SchemaFactory.createForClass(ContestResult);