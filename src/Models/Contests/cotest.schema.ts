import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import   mongoose from 'mongoose';
import { User } from '../User/user.schema';


@Schema({timestamps:true})
export class Contest  {

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, enum: ['global', 'duel'], required: true })
  type: string;

  @Prop({ type: String, required: true })
  level: string;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: String, enum: ['upcoming', 'active','finished'], default: 'upcoming' })
  status: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }], default: [] })
  participants: mongoose.Schema.Types.ObjectId[]; // for global contest to add friends who are participating in the contest
   
  @Prop({
  type: [{
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswerIndex: { type: Number, required: true },
  }],
  default: []
})
questions: { question: string; options: string[]; correctAnswerIndex: number }[]

@Prop({ type: Number, required: true, default: 5 })
questionScore: number // base score for each question in this contest
 
  @Prop({ type: String, required: true })
  difficulty: string;
  // Duel only
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
  challengerId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
  challengedId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: ['pending', 'accepted', 'rejected'], default: null })
  duelStatus: string;
  
}

export const ContestSchema = SchemaFactory.createForClass(Contest);