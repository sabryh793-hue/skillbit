import { Injectable } from "@nestjs/common";
import { DBService } from "../abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Level } from "./level.schema";
import { Model } from "mongoose";


@Injectable() 
export class LevelRepo extends DBService<Level> {
  constructor(@InjectModel(Level.name) private levelModel: Model<Level>) {
    super(levelModel)
  }

}