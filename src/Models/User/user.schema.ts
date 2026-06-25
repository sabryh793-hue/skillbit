import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Badge } from '../Badges/badge.schema';
import { Achievement } from '../Achievements/achievement.schema';
import { UserRoles } from 'src/common';
import { Rank } from 'src/common/enums/RankEnum';

@Schema({timestamps:true})
export class User  {

  @Prop({ type: String, required: true, trim: true })
  fullname: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({
     type: String ,
     required: function() { return this.userAgent === 'local' }, // password is required only for local users mean just return true if userAgent is local and return false if userAgent is google
    }) 
  password: string;

  @Prop({ type: String, enum: UserRoles, default: UserRoles.User })
  role: UserRoles;

  @Prop({ type: String, enum: ['local', 'google'], default: 'local' })
  userAgent: string;

  @Prop({ type: String, default: null })
  profilePicture: string;

  @Prop({ type: Number, default:1})
  level: number;

  @Prop({ type: Number, default: 0 })
  score: number; 

  @Prop({ type: String, enum:Rank, default: Rank.beginner })//last badge earned
  rank: Rank;

  @Prop({
  type: [{ from: { type: mongoose.Schema.Types.ObjectId } }],
  default: []
})
friendRequests: { from: mongoose.Schema.Types.ObjectId }[]

@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], default: [] })
friends: mongoose.Schema.Types.ObjectId[]

    @Prop({
    type: {
      code: { type: String },
      expiresAt: { type: Date },
          },default: null,})
  emailOtp: {code: string ,expiresAt: Date} ;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Badge.name }], default: [] })
  earnedBadges: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Achievement.name }], default: [] })
  earnedAchievements: mongoose.Schema.Types.ObjectId[];

}
export const UserSchema = SchemaFactory.createForClass(User)