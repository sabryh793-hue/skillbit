import { Injectable } from '@nestjs/common';
import { DBService } from '../abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './quiz,schema';

@Injectable()
export class QuizRepo extends DBService<Quiz> {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
  ) {
    super(quizModel);
  }
}
