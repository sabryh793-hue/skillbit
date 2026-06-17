import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { QuizStatusEnum } from "src/common/enums/courseSatuesEnum";

@Schema({ timestamps: true })
export class Quiz {//exam paper template

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  topic:string

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
      correctAnswerIndex: { type: String, required: true },
    }],
    default: []
  })
  questions: { question: string; options: string[]; correctAnswerIndex: number }[];

  @Prop({ type: String, enum: [QuizStatusEnum], default: QuizStatusEnum.LOCKED })
  status: QuizStatusEnum
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);