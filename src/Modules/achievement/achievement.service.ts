import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AchievementRepo } from '../../Models/Achievements/achievement.repo';
import { UserRepo } from '../../Models/User/user.repo';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { CourseRepo } from '../../Models/Cousrses/course.repo';
import { EnrollmentRepo } from '../../Models/Enrollments/enrollment.repo';


@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementRepo: AchievementRepo,
    private readonly userRepo: UserRepo,
    private readonly enrollmentRepo: EnrollmentRepo,
    private readonly courseRepo: CourseRepo,
  ) { }


  async createAchievement(dto: CreateAchievementDto) {
    //if the data is already in the database, don't insert it
    const existingAchievement = await this.achievementRepo.findOne({ filter: { name: dto.name } })
    if (existingAchievement) throw new BadRequestException('Achievement already exists')
    return await this.achievementRepo.create(dto)
  }

  async seedData(dto: CreateAchievementDto[]) {
    //if the data is already in the database, don't insert it
    const existingAchievements = await this.achievementRepo.find({})
    if (existingAchievements.length > 0) return 1
    return this.achievementRepo.insertMany(dto);
  }

  async updateAchievement(id: string, dto: UpdateAchievementDto) {
    const achievement = await this.achievementRepo.findByIdAndUpdate({
      id,
      update: dto,
      options: { new: true }
    })
    if (!achievement) throw new NotFoundException('Achievement not found')
    return achievement
  }

  async deleteAchievement(id: string) {
    const achievement = await this.achievementRepo.findByIdAndDelete({ id })
    if (!achievement) throw new NotFoundException('Achievement not found')
    return true
  }

  async getAllAchievements() {
    return await this.achievementRepo.find({})
  }

  
  // check level achievements after course completed
  async checkLevelAchievements(userId: string, courseLevel: string) {
    const achievementName = {
      '1': 'Contestant',
      '2': 'Gladiator',
      '3': 'Veteran'
    }[courseLevel]

    if (achievementName) await this.awardAchievement(userId, achievementName)
  }

  // check rank achievements after score changes
  async checkRankAchievements(userId: string) {
    const user = await this.userRepo.findById({ id: userId })
    if (!user) return

    const score = user.score
    if (score >= 1000) await this.awardAchievement(userId, 'The Novice')
    if (score >= 3500) await this.awardAchievement(userId, 'The Specialist')
    if (score >= 8500) await this.awardAchievement(userId, 'The Expert')
    if (score >= 20000) await this.awardAchievement(userId, 'The Master')
    if (score >= 50000) await this.awardAchievement(userId, 'The Grandmaster')
  }

  // check educational achievements after course completed
  async checkEducationalAchievements(userId: string) {
    const enrollment = await this.enrollmentRepo.findOne({ filter: { userId } })
    if (!enrollment) throw new NotFoundException('You should enroll in courses first')

    const allRequired = await this.courseRepo.find({ type: { $ne: 'optional' } })
    const allOptional = await this.courseRepo.find({ type: 'optional' })

    const completedRequiredIds = enrollment.completedCourses
      .map((id: any) => id.toString())
    const completedOptionalIds = enrollment.completedOptionalCourses
      .map((id: any) => id.toString())

    const allRequiredDone = allRequired
      .every((c: any) => completedRequiredIds.includes(c['_id'].toString()))
    const allOptionalDone = allOptional
      .every((c: any) => completedOptionalIds.includes(c['_id'].toString()))

    // Scholar = all optional only
    if (allOptionalDone) await this.awardAchievement(userId, 'Scholar')

    // Completionist = all required + all optional
    if (allRequiredDone && allOptionalDone)
      await this.awardAchievement(userId, 'The Completionist')
  }

  // check skillbit champion after every achievement
  private async checkSkillbitChampion(userId: string) {
    const user = await this.userRepo.findById({ id: userId })
    if (!user) return

    const earnedAchievements = user.earnedAchievements
      .map((id: any) => id.toString())
    const totalAchievements = await this.achievementRepo.find({})

    const allExceptChampion = totalAchievements
      .filter((a: any) => a.name !== 'The Skillbit Champion')

    const allEarned = allExceptChampion
      .every((a: any) => earnedAchievements.includes(a['_id'].toString()))

    if (allEarned) await this.awardAchievement(userId, 'The Skillbit Champion')
  }

  // award achievement — calls checkSkillbitChampion after every award
  async awardAchievement(userId: string, achievementName: string) {
    const achievement = await this.achievementRepo.findOne({
      filter: { name: achievementName }
    })
    if (!achievement) throw new NotFoundException('Achievement not found')

    // check if already earned
    const alreadyEarned = await this.userRepo.findOne({
      filter: { _id: userId, earnedAchievements: achievement['_id'] }
    })
    if (alreadyEarned) throw new BadRequestException('You already earned this achievement')

    // award achievement + xp
    await this.userRepo.findByIdAndUpdate({
      id: userId,
      update: {
        $push: { earnedAchievements: achievement['_id'] }
      }
    })

    // always check skillbit champion after any achievement
    await this.checkSkillbitChampion(userId)
  }
}