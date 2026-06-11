import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { User } from '../User/user.schema'
import { Contest } from './cotest.schema'

@Schema({ timestamps: true })
export class DuelRequest {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Contest.name, required: true })
  contestId: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  challengerId: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  challengedId: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: string
}

export const DuelRequestSchema = SchemaFactory.createForClass(DuelRequest)