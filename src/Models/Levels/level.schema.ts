import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"; 

@Schema()
export class Level {

    @Prop({ type: Number, required: true, trim: true })
    order: number;

    @Prop({ type: String, required: true, trim: true })
    title: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    earnScore: number;
    
}

export const LevelSchema = SchemaFactory.createForClass(Level)