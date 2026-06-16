import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CourseRepo } from '../../Models/Cousrses/course.repo';
import { CourseType } from '../../Models/Cousrses/course.schema';
import { LevelRepo } from '../../Models/Levels/level.repo';
import { LessonRepo } from '../../Models/Lessons/lesson.repo';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRepo } from '../../Models/User/user.repo';
import { QuizRepo } from '../../Models/Quizes/quiz.repo';
import { AchievementService } from '../achievement/achievement.service';
import { EnrollmentRepo } from '../../Models/Enrollments/enrollment.repo';
import { CourseStatusEnum } from 'src/common/enums/courseSatuesEnum'; 

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
      { course: courseId }, 
      {},
      { sort: { order: 1 } }
    )

    const lessonsWithQuizzes = await Promise.all(
      lessons.map(async (lesson) => {
        const quiz = await this.quizRepo.findOne({
          filter: { lessonId: lesson['_id'] }
        })
        return {
          name: lesson.title,
          id: lesson['_id'],
          order: lesson.order,
          isLocked: lesson.isLocked,
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
    //update course status
    await this.courseRepo.findOneAndUpdate({
      filter: { _id: courseId },
      update: { $set: { status: CourseStatusEnum.ACTIVE } },
      options: { new: true }
    })
    return true
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
    if (percentage === undefined) throw new NotFoundException('Course progress not found');

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

    //update course status to finished
    await this.courseRepo.findOneAndUpdate({
      filter: { _id: courseId },
      update: { $set: { status: CourseStatusEnum.FINISHED } },
      options: { new: true }
    })



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
    const percentage = totalQuizzes > 0 ? (passedQuizzesCount / totalQuizzes) * 100 : 0;

    // Update the course progress in the enrollment record.
    // Check if progress already exists for this course.
    const hasProgress = enrollment.courseProgress.some(
      (item: any) => item.courseId.toString() === courseId
    );

    if (hasProgress) {
      // If it exists, update the specific item's percentage
      await this.enrollmentRepo.findOneAndUpdate({
        filter: { userId, 'courseProgress.courseId': courseId },
        update: { $set: { 'courseProgress.$.percentage': percentage } },
        options: { new: true }
      });
    } else {
      // If it doesn't exist, push the new progress object
      await this.enrollmentRepo.findOneAndUpdate({
        filter: { userId },
        update: { $push: { courseProgress: { courseId, percentage } } },
        options: { new: true }
      });
    }
    return percentage;
  }

  async getLvlProgress(userId: string, levelnum: number) {
    const enrollment = await this.enrollmentRepo.findOne({ filter: { userId } });

    const courses = await this.courseRepo.find({ level: levelnum });
    const totalCourses = courses.length;

    const completedCourseIds = enrollment?.completedCourses.map((id: any) => id.toString());
    const levelCourseIds = courses.map((c: any) => c['_id'].toString());
    const passedCoursesCount = levelCourseIds.filter(id => completedCourseIds?.includes(id)).length;
     //const passedCoursesCount = completedCourseIds.length
    const percentage = (passedCoursesCount / totalCourses) * 100;

    return percentage;
  }


  async getUserHomeScreenData(userId: string, levelnum: number) {
    // get USER
    const user = await this.userRepo.findById({ id: userId })
    if (!user) throw new NotFoundException('User not found');

    //get level progress percentage
    const levelProgress = await this.getLvlProgress(userId, levelnum)

    // get courses in this level
    const courses = await this.courseRepo.find({ level: levelnum }, {}, { sort: { order: 1 } });
            
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await this.getCourseProgress(userId, course['_id'].toString());
        return {
          id: course['_id'],
          title: course.title,
          description: course.description,
          type: course.type,
          earnScore: course.earnScore,
          passScore: course.passScore,
          isTutorial: course.isTutorial,
          isLocked: course.isLocked,
          status: course.status,
          image: course.courseImage,
          courseProgress: progress,
        };
      })
    );

    return {
      userName: user.fullname,
      userProfilePicture: user.profilePicture,
      levelProgress: levelProgress,
      courses: coursesWithProgress,
    };
  }
}