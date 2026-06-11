import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Achievement  {

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);