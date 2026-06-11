import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Badge  {

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  iconUrl: string;

  @Prop({ type: Number, required: true })
   minimumScore: number;

}

export const BadgeSchema = SchemaFactory.createForClass(Badge);