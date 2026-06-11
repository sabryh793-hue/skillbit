import { Injectable } from "@nestjs/common";
import { DBService } from "../abstract.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Course } from "./course.schema";


@Injectable() 
export class CourseRepo extends DBService<Course> {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {
    super(courseModel)
  }

  
}