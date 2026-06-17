import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class QuizAttempt { // Student's Answer Sheet
 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  courseId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' })
  lessonId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [String], default: [] })
  answers: string[];

  @Prop({ type: Number, default: 0 })
  correctCount: number;

  @Prop({ type: Number, default: 0 })
  score: number; // percentage 0-100, calculated in service

  @Prop({ type: Boolean, default: false })
  passed: boolean;

  @Prop({ type: Number, default: 0 })
  timeTaken: number; // seconds

  @Prop({ type: Number, default: 0 })
  xpEarned: number;

  @Prop({ type: Number, default: 0 })
  xpLost: number;

  @Prop({ type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' })
  status: string;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);