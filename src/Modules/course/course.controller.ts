import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/RolesEnum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from 'src/common/decorators/user.decorator';


@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  
   @Auth(UserRoles.Admin)
   @Post()
  async createCourse(@Body() dto: CreateCourseDto) {
    const course =await this.courseService.createCourse(dto);
    return {message: "Course created successfully", course}
  } 

  @UseGuards(AuthGuard)
  @Get()
  async getCoursesByLevel(@Query('level') levelnum: number) {
    const courses =await this.courseService.getCoursesByLevel(levelnum);
    console.log(courses)
    return {message: "Courses fetched successfully", courses}
  }

  @UseGuards(AuthGuard)
  @Get('search')
  async getCourseByName(@Query('name') name: string) {
    const courses = await this.courseService.getCourseByName(name);
    return {message: "Courses fetched successfully", courses}
  }

   @UseGuards(AuthGuard)
  @Get('home')
  async getUserHomeScreenData(@User('id') userId: string,@Query('level', ParseIntPipe) level: number) {
    console.log(level)
    const data =await this.courseService.getUserHomeScreenData(userId, level);
    return {message: "Home screen data fetched successfully", data}
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getCourseById(@Param('id') id: string) {
      console.log('GET COURSE ID =', id);

    const course = await this.courseService.getCourseById(id);
    return {message: "Course fetched successfully", course}
  }

  @Auth(UserRoles.Admin)
  @Patch(':id')
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    const course =await this.courseService.updateCourse(id, dto);
    return {message: "Course updated successfully", course}
  }

  @Auth(UserRoles.Admin)
  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    await this.courseService.deleteCourse(id)
    return {message: "Course deleted successfully"}
  }

  @UseGuards(AuthGuard)
  @Post('enroll/:courseId')
  async enrollInCourse(@User('id') userId: string, @Param('courseId') courseId: string) {
    const course =await this.courseService.enrollInCourse(userId, courseId);
    return {message: "Course enrolled successfully", course}
  }

  @UseGuards(AuthGuard)
  @Post(':id/complete')
  async completeCourse(@User('id') userId: string, @Param('id') courseId: string) {
    const course =await this.courseService.finishCourse(userId, courseId);
    return {message: "Course completed successfully", course}
  }

  @UseGuards(AuthGuard)
  @Get(':id/progress')
  async courseProgress(@User('id') userId: string, @Param('id') courseId: string) {
      console.log('HOME ENDPOINT HIT');

    const percentage =await this.courseService.getCourseProgress(userId, courseId);
    return {message: "Course progress fetched successfully", percentage}
  }

}
