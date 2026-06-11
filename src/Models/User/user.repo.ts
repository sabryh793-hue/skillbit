import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { DBService } from 'src/Models/abstract.repository'
import { User } from './user.schema'

@Injectable() //MAKE THIS CLASS INJECTABLE SO THAT IT CAN BE USED AS A PROVIDER[service,repo,...] IN NESTJS
export class UserRepo extends DBService<User> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super(userModel)//SUPER MEANS CALL THE CONSTRUCTOR OF THE PARENT CLASS DBService
  }

  async findByEmail(email: string) {//to change return type change it in user service too
    return await this.findOne({ filter: { email } })
}
}