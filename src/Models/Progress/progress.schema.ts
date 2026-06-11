import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Progress {

  // WHICH USER
  @Prop({//this will hold the reference to the user who is making progress
    type: mongoose.Schema.Types.ObjectId,//here we are using ObjectId to reference the User model
    ref: 'User',
    required: true
  })
  userId: mongoose.Types.ObjectId;

  // WHICH COURSE
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  })
  courseId: mongoose.Types.ObjectId;

  // WHICH LESSONS COMPLETED
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    default: []
  })
  completedLessons: mongoose.Types.ObjectId[];

 
  @Prop({ default: 0 })
  score: number;              // grows as user completes quizzes → 30

  @Prop({ default: 0 })
  totalQuestions: number;     // grows as more quizzes completed → 50

  @Prop({ default: 0 })
  percentage: number;         // displayed in UI circle → 60%

  // STATUS
  @Prop({
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  })
  status: string;              

}

export const ProgressSchema = SchemaFactory.createForClass(Progress)