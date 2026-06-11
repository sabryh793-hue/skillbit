import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateBulkLessonsDto, CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/RolesEnum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Auth(UserRoles.Admin)
  @Post()
  async createLesson(@Body() dto: CreateLessonDto) {
    const lesson = await this.lessonService.createLesson(dto);
    return {message: 'Lesson created successfully' , lesson};
  }

  
 @Auth(UserRoles.Admin)
  @Post('bulk')
  async bulkCreateLessons(@Body() dto: CreateBulkLessonsDto) {
  const lessons = await this.lessonService.bulkCreateLessons(dto.lessons)
  return { message: 'Lessons created successfully', data: lessons }
}
  
  @UseGuards(AuthGuard)
  @Get()
  async getLessonsByCourse(@Query('course') courseId: string) {
    const lessons = await this.lessonService.getLessonsByCourse(courseId);
    return {message: 'Lessons fetched successfully' , lessons};
  }

  @Auth(UserRoles.Admin)
  @Patch(':id')
  async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    const lesson = await this.lessonService.updateLesson(id, dto);
    return {message: 'Lesson updated successfully' , lesson};
  }

  @Auth(UserRoles.Admin)
  @Delete(':id')
  async deleteLesson(@Param('id') id: string) {
    const lesson =await this.lessonService.deleteLesson(id);
    return {message: 'Lesson deleted successfully' , lesson};
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getLessonWithQuiz(@Param('id') id: string) {
    const lesson = await this.lessonService.getLessonWithQuiz(id);
    return {message: 'Lesson with quiz fetched successfully' , lesson};
  }

  @Auth(UserRoles.Admin)
 @Patch(':id/upload-material')
 @UseInterceptors(FileInterceptor('file', {
  storage: memoryStorage()
}))
async uploadMaterial(
  @Param('id') lessonId: string,
  @UploadedFile() file: Express.Multer.File
) {
  const result = await this.lessonService.uploadMaterial(lessonId, file)
  return { message: 'Material uploaded successfully', data: result }
}
}
