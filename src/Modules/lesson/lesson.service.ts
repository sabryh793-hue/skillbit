import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LessonRepo } from '../../Models/Lessons/lesson.repo';
import { CourseRepo } from '../../Models/Cousrses/course.repo';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { uploadToCloudinary } from '../../common/utils/cloudinary';
import { QuizRepo } from '../../Models/Quizes/quiz.repo';
  
@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepo: LessonRepo,
    private readonly courseRepo: CourseRepo, 
    private readonly quizRepo: QuizRepo,
       
  ) {}

  async createLesson(dto: CreateLessonDto) {
  const course = await this.courseRepo.findById({ id: dto.course });
  if (!course) throw new NotFoundException('Course not found');

  const titleTaken = await this.lessonRepo.findOne({
    filter: { course: new Types.ObjectId(dto.course), title: dto.title },
  });
  if (titleTaken)
    throw new BadRequestException('A lesson with this title already exists in this course');

  const orderTaken = await this.lessonRepo.findOne({
    filter: { course: new Types.ObjectId(dto.course), order: dto.order },
  });
  if (orderTaken)
    throw new BadRequestException(`A lesson with order ${dto.order} already exists in this course`);

  const isLocked = dto.order !== 1; //
  const lesson = await this.lessonRepo.create({ ...dto, isLocked });
  //add this lesson to course lessons list
  await this.courseRepo.findByIdAndUpdate({
    id: dto.course,
    update: { $push: { lessons: lesson['_id'] } },
    options: { new: true },
  });
  return lesson;
  }

  async bulkCreateLessons(lessons: CreateLessonDto[]) {
  const preparedLessons = lessons.map(lesson => ({
    ...lesson,
    isLocked: lesson.order !== 1
  }))

  return await this.lessonRepo.insertMany(preparedLessons)
  }
  
   async getLessonsByCourse(courseId: string) {
    return this.lessonRepo.find(
      { course: new Types.ObjectId(courseId) },
      {},
      { sort: { order: 1 } },
    );
   }

  async getLessonWithQuiz(lessonId: string) {
    const lesson = await this.lessonRepo.findById({ id: lessonId });
    if (!lesson) throw new NotFoundException('Lesson not found');

     if (lesson.isLocked) {
      throw new ForbiddenException('You can not access this lesson');
    }
    //get quiz of lesson
    const quiz = await this.quizRepo.findOne({filter:{lessonId:lessonId}})
    
  
   return {lesson,quiz} 
    
  }

  async uploadMaterial(lessonId: string, file: Express.Multer.File) {
  const lesson = await this.lessonRepo.findById({ id: lessonId })
  if (!lesson) throw new NotFoundException('Lesson not found')

  const result: any = await uploadToCloudinary(file, 'lesson-materials')

  await this.lessonRepo.findByIdAndUpdate({
    id: lessonId,
    update: { $push: { materials: result.secure_url } }
  })

  return { materialUrl: result.secure_url }
}

  async updateLesson(lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.lessonRepo.findByIdAndUpdate({
      id: lessonId,
      update: dto,
      options: { new: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
   /// return lesson;
  }

  async deleteLesson(lessonId: string) {
  const lesson = await this.lessonRepo.findByIdAndDelete({ id: lessonId });
  if (!lesson) throw new NotFoundException('Lesson not found');

  // Shift all lessons after the deleted one down by 1
  await this.lessonRepo.Update({
    filter: { course: lesson.course, order: { $gt: lesson.order } },
    update: { $inc: { order: -1 } },//decrement order of lessons after the deleted one
  });

  return lesson;
  }
} 