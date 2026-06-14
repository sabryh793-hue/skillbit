// course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose'
import { CourseStatusEnum } from 'src/common/enums/courseSatuesEnum';

export enum CourseType {
  MANDATORY = 'mandatory',
  OPTIONAL = 'optional',
}

@Schema({ timestamps: true })
export class Course {

  @Prop({ type: String, required: true, trim: true })//trim =>to remove spaces from the start and end
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true, ref: 'Level' })
  level: number;

  @Prop({ type: Number, default: 0 })
  order: number;                  //order inside the level (1, 2, 3...)

  @Prop({ type: String, enum: CourseType, default: CourseType.MANDATORY })
  type: CourseType;               //mandatory or optional

  @Prop({ type: Boolean, default: false })
  isTutorial: boolean;

  @Prop({ type: Number, default: 0 })
  earnScore: number;

  @Prop({ type: Boolean, default: true })
  isLocked: boolean;              //optional courses will always be false

  @Prop({ type: Number, default: 70, min: 0, max: 100 })
  passScore: number;            // min quiz % score to unlock the NEXT mandatory course

  @Prop({ type: Number, default: 0 })
  averageRating: number;

  @Prop({ type: Number, default: 0 })
  totalFavorites: number;

  @Prop({ type: String, default: '' })
  courseImage: string;

  @Prop({ type: CourseStatusEnum, default: CourseStatusEnum.LOCKED })
  status: CourseStatusEnum;

}

export const CourseSchema = SchemaFactory.createForClass(Course);