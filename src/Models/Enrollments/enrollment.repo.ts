import { Injectable } from '@nestjs/common';
import { DBService } from '../abstract.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Enrollment } from './enrollment.schema';


@Injectable()
export class EnrollmentRepo extends DBService<Enrollment> {
  constructor(@InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>) {
    
    super(enrollmentModel);
  }
}
