import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Quiz {//exam paper template

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null })
  lessonId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, enum: ['easy', 'medium', 'hard'], required: true })
  difficulty: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Number, default: 70 })
  passingScore: number;

  @Prop({ type: Number, default: 0 })
  earnedXp: number;

  @Prop({ type: Number, default: 0 })
  timeLimit: number;

  @Prop({
    type: [{
      question:      { type: String, required: true },
      options:       { type: [String], required: true },
      correctAnswerIndex: { type: Number, required: true },
    }],
    default: []
  })
  questions: { question: string; options: string[]; correctAnswerIndex: number }[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);