import { Injectable } from '@nestjs/common';
import { DBService } from '../abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from './lesson.schem';

@Injectable()
export class LessonRepo extends DBService<Lesson> {
  constructor(@InjectModel(Lesson.name) private lessonModel: Model<Lesson>) {
    super(lessonModel);
  }
}
