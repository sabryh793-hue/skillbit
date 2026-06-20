import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { UserRoles } from 'src/common';
import { User } from 'src/common/decorators/user.decorator';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Auth(UserRoles.Admin)
  @Post('create')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    const quiz = await this.quizService.createQuiz(createQuizDto)
    return { message: 'Quiz created successfully', data: quiz }
  }

  @Auth(UserRoles.Admin)
  @Patch('update/:id')
  async updateQuiz(@Param('id') quizId: string, @Body() updateQuizDto: UpdateQuizDto) {
    const quiz = await this.quizService.updateQuiz(quizId, updateQuizDto)
    return { message: 'Quiz updated successfully', data: quiz }
  }

  @Auth(UserRoles.Admin)
  @Delete('delete/:id')
  async deleteQuiz(@Param('id') quizId: string) {
    await this.quizService.deleteQuiz(quizId)
    return { message: 'Quiz deleted successfully' }
  }

  
  @Auth(UserRoles.Admin , UserRoles.User)
  @Get('start/:id')
  async startQuiz(@Param('id') quizId: string , @User('id') userId: string) {
    const result = await this.quizService.startQuiz(quizId, userId)
    return { message: 'Quiz started successfully', data: result }
  }

  @Auth(UserRoles.Admin , UserRoles.User)
  @Post('submit')
  async submitQuiz(@Body() submitQuizDto: SubmitQuizDto, @User('id') userId: string) {
    const result = await this.quizService.submitQuiz(submitQuizDto, userId)
    return { message: 'Quiz submitted successfully', data: result }
  }

  @Auth(UserRoles.Admin , UserRoles.User)
  @Get('results/:quizId')
  async getQuizResults(@Param('quizId') quizId: string, @User('id') userId: string) {
    const result = await this.quizService.getQuizAnswers(quizId, userId)
    return { message: 'Quiz results retrieved successfully', data: result }
  }

}