import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizRepo } from '../../Models/Quizes/quiz.repo';
import { LessonRepo } from '../../Models/Lessons/lesson.repo';
import { CourseRepo } from '../../Models/Cousrses/course.repo';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizAttemptRepo } from '../../Models/Quizes/quizAttempt.repo';
import { EnrollmentRepo } from '../../Models/Enrollments/enrollment.repo';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UserRepo } from '../../Models/User/user.repo';
import axios from 'axios';
import mongoose from 'mongoose';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepo: QuizRepo,
    private readonly lessonRepo: LessonRepo,
    private readonly courseRepo: CourseRepo,
    private readonly quizAttemptRepo: QuizAttemptRepo,
    private readonly enrollmentRepo: EnrollmentRepo,
    private readonly userRepo: UserRepo,
  ) { }

  async createQuiz(createQuizDto: CreateQuizDto) {
    const lesson = await this.lessonRepo.findById({ id: createQuizDto.lessonId })
    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }

    // check if quiz already exists for this lesson
    const existingQuiz = await this.quizRepo.findOne({
      filter: { lessonId: createQuizDto.lessonId }
    })
    if (existingQuiz) {
      throw new ConflictException('Quiz already exists for this lesson')
    }

    //get the questions of contest from ai model
    
  const { data } = await axios.post(
    'https://graduation-project-production-0a8a.up.railway.app/api/v1/quiz/generate',
    {
      topic: createQuizDto.topic,
    }
  )

       // 2. create contest
       const quiz = await this.quizRepo.create({
         ...createQuizDto,
         questions : data.questions.map((q: any) => ({
           question: q.question,
           options: q.options.map((o: any) => o.text),
           correctAnswerIndex: q.correct_answer,
         }))
       })
   
       return quiz
  }

  async startQuiz(quizId: string, userId: string) {
    // 1. check quiz exists
    const quiz = await this.quizRepo.findById({ id: quizId })
    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    //if quiz has no questions return empty array
    if(!quiz.questions?.length){
      return []
    }

     // 2. check enrollment
    const lesson = await this.lessonRepo.findById({ id: quiz.lessonId })
    if (!lesson) {
      throw new NotFoundException('Lesson not found')
    }
  
     //log the course title
    const course = await this.courseRepo.findById({ id: lesson.course })

    const enrollment = await this.enrollmentRepo.findOne(
     { filter: { userId,enrolledCourses : course?._id }}
    )

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course')
    }
   

    //check if quiz  order = 1 ,, no rules to check
    if(quiz.order == 1){
      //create new attempt
      const attempt = await this.quizAttemptRepo.create({
        courseId: lesson.course,
        userId,
        quizId,
        lessonId: quiz.lessonId,
        status: 'in-progress'
      })

      //return questions without correctAnswerIndex
      const questions = quiz.questions.map(({ question, options }) => ({
        question,
        options
      }))
      return {
        attemptId: attempt['_id'],
        quizId: quiz._id,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        questions
      }
    }
   
   

    // 3. check previous quiz passed
    if (quiz.order > 1) {
      const previousQuiz = await this.quizRepo.findOne({
        filter: { lessonId: quiz.lessonId, order: quiz.order - 1 }
      })
      if (previousQuiz) {
        const isPreviousPassed = enrollment!.completedQuizes
          .some(id => id.toString() === previousQuiz._id.toString())
        if (!isPreviousPassed) {
          throw new ForbiddenException('Please pass the previous quiz first')
        }
      }
    }

    // 4. check if already inProgress attempt exists → resume it 
    const existingAttempt = await this.quizAttemptRepo.findOne({
      filter: { userId, quizId, status: 'in-progress' }
    })
    if (existingAttempt) {
      const questions = quiz.questions.map(({ question, options }) => ({
        question,
        options
      }))
      return {
        attemptId: existingAttempt._id,
        quizId: quiz._id,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        questions
      }
    }

    // 5. create new inProgress attempt
    const attempt = await this.quizAttemptRepo.create({
    
      userId,
      courseId: lesson.course,
      quizId,
      lessonId: quiz.lessonId,
      status: 'in-progress'
    })

    // 6. return questions without correctAnswerIndex
    const questions = quiz.questions.map(({ question, options }) => ({
      question,
      options
    }))

    return {
      quizTitle: quiz.title,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions
    }
  }

  async submitQuiz(submitQuizDto: SubmitQuizDto, userId: string) {
    const { quizId, answers, timeTaken } = submitQuizDto

    // 1. check quiz exists
    const quiz = await this.quizRepo.findById({ id: quizId })
    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }
   

    // 2. check if user started the quiz
    const attempt = await this.quizAttemptRepo.findOne({
      filter:{
        userId,
        quizId,
        status: 'in-progress' 
        }
    })

    if (!attempt) {
      throw new ForbiddenException('Please start the quiz first')
    }

    // 3. check all questions are answered
    if (answers.length !== quiz.questions.length) {
      throw new BadRequestException('Please answer all questions')
    }

    // 4. calculate score
    let correctCount = 0
    quiz.questions.forEach((q, index) => {
      if (q.correctAnswerIndex === answers[index]) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = score >= quiz.passingScore

    // 5. calculate xp
    const xpEarned = passed ? quiz.earnedXp : 0
    const xpLost = !passed ? Math.round(quiz.earnedXp * 0.1) : 0

    // 6. update attempt
    await this.quizAttemptRepo.findByIdAndUpdate({
      id: attempt._id,
      update: {
        answers,
        correctCount,
        score,
        passed,
        timeTaken: timeTaken || 0,
        xpEarned,
        xpLost,
        status: 'submitted'
      }
    })

    const lesson = await this.lessonRepo.findById({ id: quiz.lessonId })

    // 7. if passed → update enrollment + user score + unlock next lesson
    if (passed) {
      // add quiz to completedQuizes
      await this.enrollmentRepo.findOneAndUpdate({
        filter: { userId, courseId: lesson?.course },
        update: { $push: { completedQuizes: quizId } }
      })

      // add xp to user
      await this.userRepo.findByIdAndUpdate({
        id: userId,
        update: { $inc: { score: xpEarned } }
      })

      // unlock next lesson
      const nextLesson = await this.lessonRepo.findOne({
        filter: { courseId: lesson?.course, order: quiz.order + 1 }
      })
      if (nextLesson) {
        await this.lessonRepo.findByIdAndUpdate({
          id: nextLesson.id,
          update: { isLocked: false }
        })
      }
    }

    // 8. if failed → subtract xp
    if (!passed && xpLost > 0) {
      await this.userRepo.findByIdAndUpdate({
        id: userId,
        update: { $inc: { score: -xpLost } }
      })
    }

    return {
      passed,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      xpEarned,
      xpLost,
    }
  }

  async getQuizAnswers(quizId: string, userId: string) {
    // 1. check quiz exists
    const quiz = await this.quizRepo.findById({ id: quizId })
    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    // 2. find submitted attempt
    const attempt = await this.quizAttemptRepo.findOne({
      filter: { userId, quizId, status: 'submitted' }
    })
    if (!attempt) {
      throw new NotFoundException('No passed attempt found for this quiz')
    }

    // 3. merge questions with user answers
    const questionsWithAnswers = quiz.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      chosenAnswerIndex: attempt.answers[index],
      correctAnswerIndex: q.correctAnswerIndex,
      isCorrect: attempt.answers[index] === q.correctAnswerIndex
    }))

    return {
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: quiz.questions.length,
      timeTaken: attempt.timeTaken,
      xpEarned: attempt.xpEarned,
      questionsWithAnswers
    }
  }

  async updateQuiz(quizId: string, updateQuizDto: UpdateQuizDto) {
    const quiz = await this.quizRepo.findByIdAndUpdate({
      id: quizId,
      update: updateQuizDto,
      options: { new: true }
    })

    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    return quiz
  }

  async deleteQuiz(quizId: string) {
    // 1. delete quiz
    const quiz = await this.quizRepo.findByIdAndDelete({ id: quizId })
    if (!quiz) {
      throw new NotFoundException('Quiz not found')
    }

    // 2. delete all attempts related to this quiz
    await this.quizAttemptRepo.deleteOne({ filter: { quizId: quizId as any } })

    return true
  }
}