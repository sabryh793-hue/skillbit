import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types }  from 'mongoose';

@Schema({ timestamps: true })
export class Lesson  {

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  materials: string[];

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isLocked: boolean;

  
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
