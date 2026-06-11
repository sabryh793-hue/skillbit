import { Injectable } from '@nestjs/common';
import { DBService } from '../abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAttempt } from './quizAttempt.schema';

@Injectable()
export class QuizAttemptRepo extends DBService<QuizAttempt> {
  constructor(
    @InjectModel(QuizAttempt.name) private quizAttemptModel: Model<QuizAttempt>,
  ) {
    super(quizAttemptModel);
  }
}
