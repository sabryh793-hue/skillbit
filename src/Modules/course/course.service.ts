import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CourseRepo } from '../../Models/Cousrses/course.repo';
import { CourseType } from '../../Models/Cousrses/course.schema';
import { LevelRepo } from '../../Models/Levels/level.repo';
import { LessonRepo } from '../../Models/Lessons/lesson.repo';
import { CreateBulkCoursesDto, CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRepo } from '../../Models/User/user.repo';
import { QuizRepo } from '../../Models/Quizes/quiz.repo';
import { AchievementService } from '../achievement/achievement.service';
import { EnrollmentRepo } from '../../Models/Enrollments/enrollment.repo';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepo: CourseRepo,
    private readonly levelRepo: LevelRepo,
    private readonly lessonRepo: LessonRepo,
    private readonly userRepo: UserRepo,
    private readonly enrollmentRepo: EnrollmentRepo,
    private readonly quizRepo: QuizRepo,
    private readonly achievementService: AchievementService,
  ) { }

  //TODO:get course details with lessons and quizzes => update getCourseById

  async createCourse(dto: CreateCourseDto) {
    //check if level exists
    const level = await this.levelRepo.findOne({ filter: { order: dto.level } });
    if (!level) throw new NotFoundException('Level not found');

    //check if there is a course with same order 
    const courseByOrder = await this.courseRepo.findOne({ filter: { $and: [{ level: dto.level, order: dto.order }] } })
    if (courseByOrder) throw new BadRequestException('There is a course with this order number');

    //check if there is a course with same title
    const courseByTitle = await this.courseRepo.findOne({ filter: { $and: [{ level: dto.level, title: dto.title }] } })
    if (courseByTitle) throw new BadRequestException('There is a course with this title');

    //check if the course is mandatory and if its order is not 1 then it should be locked
    if (dto.order === 1 || dto.type === CourseType.OPTIONAL) dto.isLocked = false;
    else dto.isLocked = true;

    return this.courseRepo.create(dto);
  }

  async getCoursesByLevel(levelnum: number) {
    const courses = await this.courseRepo.find({ level: levelnum }, {}, { sort: { order: 1 } });
    return courses;
  }

  async getCourseById(courseId: string) {
    const course = await this.courseRepo.findById({ id: courseId })
    if (!course) throw new NotFoundException('Course not found')

    const lessons = await this.lessonRepo.find(
      { course: courseId }, // ✅ matches schema
      {},
      { sort: { order: 1 } }
    )

    const lessonsWithQuizzes = await Promise.all(
      lessons.map(async (lesson) => {
        const quiz = await this.quizRepo.findOne({
          filter: { lessonId: lesson['_id'] } // ✅ check your schema field name
        })
        return {
          ...lesson.toObject(),
          quiz: quiz || null
        }
      })
    )

    return {
      ...course.toObject(),
      lessons: lessonsWithQuizzes
    }
  }

  async getCourseByName(name: string) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') //means if there is any special character in the name it will be treated as a normal character and not a special character in the regex.
    const courses = await this.courseRepo.find({ title: { $regex: escaped, $options: 'i' } }, {}, { sort: { order: 1 } });
    return courses;
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    const course = await this.courseRepo.findByIdAndUpdate({
      id: courseId,
      update: dto,
      options: { new: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async deleteCourse(courseId: string) {
    const course = await this.courseRepo.findByIdAndDelete({ id: courseId });
    if (!course) throw new NotFoundException('Course not found');

    //delete all lessons at once — no loop needed
    await this.lessonRepo.deleteMany({ filter: { course: courseId } });

    return true;
  }

  async enrollInCourse(userId: string, courseId: string) {
    const course = await this.courseRepo.findById({ id: courseId });
    if (!course) throw new NotFoundException('Course not found');

    if (course.order === 1 || course.type === CourseType.OPTIONAL) {
      return this.enrollmentRepo.findOneAndUpdate({
        filter: { userId },
        update: { $push: { enrolledCourses: courseId } },
        options: { new: true, upsert: true } //upsert: true means if the enrollment record is not found, it will be created
      })
    }

    //check if this course is Unlocked or not
    if (course.isLocked) {
      throw new BadRequestException('Course is locked, you should complete the previous course first')
    }

    //update enrollment
    await this.enrollmentRepo.findOneAndUpdate({
      filter: { userId },
      update: { $push: { enrolledCourses: courseId } },
      options: { new: true }
    })
    return true
  }

  async getCourseProgress(userId: string, courseId: string) {
    //here we calc the percentage of passed quizes (from the total quizes in the course) , then we update the courseProgress in the enrollment record

    const course = await this.courseRepo.findById({ id: courseId });
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = await this.enrollmentRepo.findOne({ filter: { userId } });
    if (!enrollment) throw new NotFoundException('You should enroll in courses first');

    // 4. get all quizzes in this course
    const allQuizzes = await this.quizRepo.find({ filter: { course: courseId } })
    const totalQuizzes = allQuizzes.length

    // 5. get passed quizzes count for this course 
    const completedQuizIds = enrollment.completedQuizes.map((id: any) => id.toString())
    const courseQuizIds = allQuizzes.map((q: any) => q['_id'].toString())
    const passedQuizzesCount = courseQuizIds.filter(id => completedQuizIds.includes(id)).length

    // 6. calculate percentage
    const percentage = (passedQuizzesCount / totalQuizzes) * 100

    //update course progress in the enrollment record
    await this.enrollmentRepo.findOneAndUpdate({
      filter: { userId },
      update: { $set: { courseProgress: { courseId, percentage } } }, //set => replace the value (old vlaue => new value)
      options: { new: true }
    })
    return percentage;
  }

  async finishCourse(userId: string, courseId: string) {
    // 1. check course exists
    const course = await this.courseRepo.findById({ id: courseId })
    if (!course) throw new NotFoundException('Course not found')

    // 2. check enrollment exists
    const enrollment = await this.enrollmentRepo.findOne({ filter: { userId } })
    if (!enrollment) throw new NotFoundException('You should enroll in courses first')

    // 3. check not already completed
    if (enrollment.completedCourses.some((id: any) => id.toString() === courseId))
      throw new BadRequestException('Course already completed')

    //get course progress
    const percentage = enrollment.courseProgress.find((item: any) => item.courseId.toString() === courseId)?.percentage
    if (!percentage) throw new NotFoundException('Course progress not found');

    // Scenario 1 — below 70% → error 
    if (percentage < 70) {
      throw new BadRequestException(
        `You must pass at least 70% of quizzes. Current: ${Math.round(percentage)}%`
      )
    }

    // Scenario 2 — passed 70%+ but not all quizzes
    if (percentage >= 70 && percentage < 100) {
      await this.enrollmentRepo.findOneAndUpdate({
        filter: { userId },
        update: {
          $pull: { enrolledCourses: courseId },
          $push: { passedCourses: courseId }
        },
        options: { new: true }
      })
    }

    // Scenario 3 — completed ALL quizzes (100%) 
    if (percentage === 100 && course.type === CourseType.MANDATORY) {
      await this.enrollmentRepo.findOneAndUpdate({
        filter: { userId },
        update: {
          $pull: { enrolledCourses: courseId },
          $push: { completedCourses: courseId }
        },
        options: { new: true }
      })
    }


    if (percentage === 100 && course.type === CourseType.OPTIONAL) {
      await this.enrollmentRepo.findOneAndUpdate({
        filter: { userId },
        update: {
          $pull: { enrolledCourses: courseId },
          $push: { completedOptionalCourses: courseId }
        },
        options: { new: true }
      })
    }

    //unlock next course if this is a mandatory course 
    if (course.type === CourseType.MANDATORY) {
      const nextCourse = await this.courseRepo.findOne({ filter: { $and: [{ level: course.level, order: course.order + 1 }] } })
      if (nextCourse) {
        await this.courseRepo.findOneAndUpdate({
          filter: { _id: nextCourse._id },
          update: { $set: { isLocked: false } },
          options: { new: true }
        })
      }
    }

    //check educational achievements 
    await this.achievementService.checkEducationalAchievements(userId)

    //update user score
    const bonusCoursePoints = course.earnScore
    await this.userRepo.findOneAndUpdate({
      filter: { _id: userId },
      update: { $inc: { score: bonusCoursePoints } },
      options: { new: true }
    })



    //Update user level if this is the last course in the level
    const coursesCountInLevel = (await this.courseRepo.find({ level: course.level })).length
    if (coursesCountInLevel === course.order) {

      //get bonus level points
      const user = await this.userRepo.findById({ id: userId })
      const userLevel = user?.level ?? 0

      const level = await this.levelRepo.find({ filter: { order: userLevel } })
      const bonusLevelPoints = level['earnScore']

      await this.userRepo.findOneAndUpdate({
        filter: { _id: userId },
        update: { $inc: { level: 1, score: bonusLevelPoints } },
        options: { new: true }
      })

      //check level achievements
      await this.achievementService.checkLevelAchievements(userId, (userLevel + 1).toString());
    }


    //update user rank achievements
    await this.achievementService.checkRankAchievements(userId)


    //Update Badge



  }

  //get User Courses By their levels
  async getUserCoursesByLevels(userId: string) {
  // 1. get enrollment
  const enrollment = await this.enrollmentRepo.findOne({ filter: { userId } })
  if (!enrollment) throw new NotFoundException('You should enroll in courses first')

  // convert to string arrays once
  const completedIds = enrollment.completedCourses.map((id: any) => id.toString())
  const passedIds = enrollment.passedCourses.map((id: any) => id.toString())
  const enrolledIds = enrollment.enrolledCourses.map((id: any) => id.toString())
  const completedOptionalIds = enrollment.completedOptionalCourses.map((id: any) => id.toString())

  // 2. get all levels + all courses in ONE call each
  const [levels, allCourses] = await Promise.all([
    this.levelRepo.find({}),
    this.courseRepo.find({}) // get ALL courses at once ✅
  ]) 

  // 3. group courses by level in memory (no more DB calls!)
  const result = levels.map((level: any) => {
    const levelCourses = allCourses
      .filter((c: any) => c.level.toString() === level['_id'].toString())
      .map((course: any) => {
        const courseId = course['_id'].toString()

        let status: string
        if (course.type === CourseType.OPTIONAL) {
          status = completedOptionalIds.includes(courseId) ? 'completed' : 'not started'
        } else {
          if (completedIds.includes(courseId)) status = 'completed'
          else if (passedIds.includes(courseId)) status = 'passed'
          else if (enrolledIds.includes(courseId)) status = 'enrolled'
          else status = 'not started'
        }

        return {
          _id: course['_id'],
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          order: course.order,
          type: course.type,
          isLocked: course.isLocked,
          earnScore: course.earnScore,
          profilePicture: course.profilePicture,
          status 
        }
      })
      .sort((a: any, b: any) => a.order - b.order) // sort by order

    return {
      level: {
        _id: level['_id'],
        name: level.name
      },
      courses: levelCourses
    }
  })

  return result
}
}