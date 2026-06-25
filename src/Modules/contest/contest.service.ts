import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateContestDto } from './dto/create-contest.dto';
import { ContestRepo } from 'src/Models/Contests/contest.repo';
import { UserRepo } from 'src/Models/User/user.repo';
import { ContestResultRepo } from 'src/Models/Contests/cotest.result.repo';
import { calculateQuestionScore, leaderboardModifiers } from 'src/common/utils/score-calculator';
import { DuelRequestRepo } from 'src/Models/Contests/duel.request.repo';
import { sendEmail } from 'src/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AchievementService } from '../achievement/achievement.service';
import axios from 'axios';
import { SubmitContestDto } from './dto/submitContestDto';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class ContestService {
  constructor(
    private readonly contestRepo: ContestRepo,
    private readonly userRepo: UserRepo,
    private readonly contestResultRepo: ContestResultRepo,
    private readonly duelRequestRepo: DuelRequestRepo,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly achievementService: AchievementService,
    private readonly leaderboardService: LeaderboardService,
  ) { }


  async createContest(dto: CreateContestDto ) {
    // delete old finished contests for same level and type
    await this.contestRepo.deleteOne({
      filter: {
        level: dto.level,
        type: dto.type,
        status: 'finished'
      }
    })

    // 1. check time overlap
    const existingContest = await this.contestRepo.findOne({
      filter: {
        level: dto.level,
        type: dto.type,
        startTime: {//5 pm to 5:30pm
          $gte: dto.startTime,
          $lt: new Date(new Date(dto.startTime).getTime() + dto.duration * 60 * 1000)//this line calculate end time[5:30pm]
        }
      }
    })
    if (existingContest)
      throw new ConflictException('There is a contest already exists at this time')

    //get the questions of contest from ai model
    let data;
try {
    data  = await axios.post(
    'https://graduation-project-production-0a8a.up.railway.app/api/v1/quiz/generate',
    {
      topic: dto.topic,
      easy_count: dto.easy_count,
      medium_count: dto.medium_count,
      hard_count: dto.hard_count
    }
  )
} catch (error) {
  throw new ServiceUnavailableException(
    'Quiz generation service is currently unavailable. Please try again later.'
  )
}
    // 2. create contest
    const contest = await this.contestRepo.create({
        ...dto,
        questions : data.questions.map((q: any) => ({
        question: q.question,
        options: q.options.map((o: any) => o.text),
        correctAnswerIndex: q.correct_answer,
        correctAnswerHint: q.explanation ,
        status: 'upcoming',
      })),
    }) 

    return contest['_id']
  }

   async joinContest(user: any, contestId: string) {
    // 1. check contest exists
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) {
      throw new NotFoundException('Contest not found')
    }

    // 2. check contest is not finished
    if (contest.status === 'finished') {
      throw new BadRequestException('Contest is already finished')
    }

    // 3. check user level matches contest level
    if (user.level.toString() !== contest.level.toString()) {
      throw new ForbiddenException('You are not eligible for this contest')
    }

    // 4. check if user already joined
    const alreadyJoined = contest.participants
      .some(id => id.toString() === user._id.toString())//some used for checking if any element in array satisfies the condition.
    if (alreadyJoined) {
      throw new BadRequestException('You already joined this contest')
    }

    // 5. add user to participants
    await this.contestRepo.findByIdAndUpdate({
      id: contestId,
      update: { $push: { participants: user._id } }
    })

    // send email to participant
     sendEmail({
      to: user.email as string,
      subject: '🏆 Contest Registration Confirmed!',
      html: `<h1>Hello ${user.fullname}!</h1>
         <p>You have successfully joined: <strong>${contest.title}</strong></p>
         <p>Starts at: <strong>${contest.startTime}</strong></p>`
    }).catch(err => console.error('Email failed:', err));

    // schedule reminder 15 min before
    const reminderTime = new Date(contest.startTime.getTime() - 15 * 60 * 1000)

    const job = new CronJob(reminderTime, async () => {
      await sendEmail({
        to: user.email,
        subject: '⏰ Contest Starting in 15 Minutes!',
        html: `<h1>Hello ${user.fullname}!</h1>
               <p><strong>${contest.title}</strong> starts in 15 minutes! 💪</p>`
      })
    })
    this.schedulerRegistry.addCronJob(`reminder-${contestId}-${user._id}`, job)
    job.start()

    return true
  }

  async startContest(contestId: string) {
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) throw new NotFoundException('Contest not found')


    if (contest.startTime > new Date()) throw new BadRequestException('Contest is not started yet')  
    if (contest.status === 'finished') throw new BadRequestException('Contest is already finished')

    
    await this.contestRepo.findByIdAndUpdate({
      id: contestId,
      update: { status: 'active' }
    })

    const questions = contest.questions.map(({ question, options }) => ({
        question,
        options
      }))
  
    //return questions of contest
    return {
       id : contest._id,
       difficulty : contest.difficulty,
       timeLimit : contest.duration,
       passingScore : contest.questionScore,
       participants : contest.participants.length,
       questions  }
  }

  async contestDetailsOfUser(userId: string) {
    const user = await this.userRepo.findById({ id: userId })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    
    const contest = await this.contestRepo.findOne({
      filter: {
        level: user.level,
        status: 'upcoming'
      }
    })

    if (!contest) {
      throw new NotFoundException('Contest not found')
    }
     return {
      level : contest.level,
      id : contest?.['_id'],
      remainingTime: contest?.startTime.getTime() - Date.now(),
      startingDateofContest: contest?.startTime,
      difficulty : contest?.difficulty,
    }
  } 

  async submitContest(user: any, dto:SubmitContestDto) {
    const contest = await this.contestRepo.findById({ id: dto.contestId })
    if (!contest) throw new NotFoundException('Contest not found')
    
    const isParticipant = contest.participants
      .some(id => id.toString() === user._id.toString())
    if (!isParticipant)
      throw new ForbiddenException('You are not a participant in this contest')
    
    const existingResult = await this.contestResultRepo.findOne({
      filter: { contestId: dto.contestId, userId: user._id }
    })
    if (existingResult)
      throw new BadRequestException('You already submitted this contest')

    let totalScore = 0
    let totalLost = 0
    let correctCount = 0

  
    contest.questions.forEach((q, index) => {
      if (dto.answers[index] === '-1' || dto.answers[index] === undefined) return//means question is not answered return to the next iteration

      const isCorrect = q.correctAnswerIndex === dto.answers[index]
      if (isCorrect) correctCount++
    
      const { gained, lost } = calculateQuestionScore(
        contest.questionScore,
        user.level,
        user.rank,
        contest.difficulty,
        isCorrect,
        undefined
      )
      totalScore += gained
      totalLost += lost
    })

    await this.contestResultRepo.create({ 
      contestId: dto.contestId,
      userId: user._id,
      answers: dto.answers, 
      correctCount,
      score: totalScore,
      timeTaken: dto.timeTaken,
      xpEarned: totalScore,
      xpLost: totalLost
    })

    await this.userRepo.findByIdAndUpdate({
      id: user._id,
      update: { $inc: { score: totalScore - totalLost } }
    })
  
    //check achievements
    await this.achievementService.checkRankAchievements(user._id)
    
  
    return {
      correctCount,
      wrongCount : contest.questions.length - correctCount,
      totalQuestions: contest.questions.length,
      score: totalScore,
      lost: totalLost,
      timeTaken: dto.timeTaken
    }
  }

  async getContestResults(userId: string, contestId: string) {
  const contest = await this.contestRepo.findById({ id: contestId })
  if (!contest) throw new NotFoundException('Contest not found')

  const allResults = await this.contestResultRepo.find(
    { contestId: contestId as any },
    {},
    { sort: { score: -1, timeTaken: 1 } }
  )

  // duel → winner/loser only
  if (contest.type === 'duel') {
    if (allResults.length < 2)
      throw new BadRequestException('Both users must submit first')

    const winner = allResults[0]
    const loser = allResults[1]

    return {
      type: 'duel',
      winner: winner.userId,
      loser: loser.userId,
      results: allResults
    }
  }
//update leaderboard
await this.leaderboardService.updateLeaderboard(contestId)

  // global → top 3 + leaderboard bonus
  const top3 = await Promise.all( 
    allResults.slice(0, 3).map(async (result, index) => {
      const position = index + 1
      const bonus = leaderboardModifiers[position] 

      // get user data
      const user = await this.userRepo.findById({
        id: result.userId,
        projection: { fullname: 1, profilePicture: 1, rank: 1 }
      })

      return {// returns to the array, not the function,that's what Promise.all is for
        score: Math.floor(result.score * bonus),
        correctCount : result.correctCount,
        wrongCount : contest.questions.length - result.correctCount,
        totalQuestions: contest.questions.length,
        rank: position,
        timeTaken: result.timeTaken,
        fullname: user?.fullname,
        profilePicture: user?.profilePicture,
        badge: user?.rank,
        achievements: user?.earnedAchievements
      }
    })
  )

  // get current user rank + data
  const userRank = allResults
    .findIndex(r => r.userId.toString() === userId.toString()) + 1
    
  const myResult = allResults.find(r => r.userId.toString() === userId.toString())

  const me = await this.userRepo.findById({
    id: userId,
    projection: { fullname: 1, profilePicture: 1, rank: 1 }
  })

  return {
    type: 'global',
    top3,
    myResult: {
      rank: userRank,
      score: myResult?.score,
      timeTaken: myResult?.timeTaken,
      correctCount: myResult?.correctCount,
      fullname: me?.fullname,
      profilePicture: me?.profilePicture,
      badge: me?.rank,
      achievements:me?.earnedAchievements
    }
  }
  }

  async getContestAnswers(userId: string, contestId: string) {
    const contest = await this.contestRepo.findById({ id: contestId })
    if (!contest) throw new NotFoundException('Contest not found')

    const result = await this.contestResultRepo.findOne({
      filter: { contestId, userId }
    })
    if (!result) throw new NotFoundException('Result not found, you may not have submitted this contest')

    const questionsWithAnswers = contest.questions.map((q, index) => ({
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      chosenAnswerIndex: result.answers[index],
      hint: q.correctAnswerHint ,
      isCorrect: result?.answers[index] === q.correctAnswerIndex
    }))

    return { 
      score: result.score,
       correctCount: result.correctCount, 
       totalQuestions: contest.questions.length,
       timeTaken: result.timeTaken,
       xpEarned: result.xpEarned,
       questionsWithAnswers 
      }
  }


  //Duel Contest

  async sendDuelRequest(user: any, challengedId: string) {
    // 1. can't duel yourself
    if (user._id.toString() === challengedId.toString())
      throw new BadRequestException('You cannot duel yourself')

    // 2. check challenged user exists
    const challengedUser = await this.userRepo.findById({ id: challengedId })
    if (!challengedUser) throw new NotFoundException('User not found')

    // 3. check they are friends
    const isFriend = user.friends
      .some((id: any) => id.toString() === challengedId.toString())
    if (!isFriend) throw new BadRequestException('You can only duel friends')

    // 4. check no pending duel request between them
    const existingRequest = await this.duelRequestRepo.findOne({
      filter: {
        status: 'pending',
        $or: [
          { challengerId: user._id, challengedId: challengedId },
          { challengerId: challengedId, challengedId: user._id }
        ]
      }
    })
    if (existingRequest) throw new BadRequestException('A duel request already exists')

    //create contest
    const contest = await this.contestRepo.create({
      title: `Duel - ${user.fullname} vs ${challengedUser.fullname}`,
      description: 'A duel contest between two players',
      level: user.level,
      type: 'duel',
      duration: 60,
      questionScore: 10,
      difficulty: user.rank,
      questions: [],
      participants: [user._id, challengedId],
      status: 'upcoming',
      startTime: new Date(Date.now() + 60 * 60 * 1000) // 60 minutes from now
    })

    // 5. create duel request
    const duelRequest = await this.duelRequestRepo.create({
      challengerId: user._id,
      challengedId: challengedId,
      contest
    })
  
    return duelRequest
  }

  async acceptDuelRequest(user: any, duelRequestId: string) {
    // 1. find duel request
    const duelRequest = await this.duelRequestRepo.findById({ id: duelRequestId })
    if (!duelRequest) throw new NotFoundException('Duel request not found')

    // 2. check user is the challenged one
    if (duelRequest.challengedId.toString() !== user._id.toString())
      throw new ForbiddenException('You are not the challenged user')

    // 3. check request is pending
    if (duelRequest.status !== 'pending')
      throw new BadRequestException('Duel request is no longer pending')

    // 4. update request status only
    await this.duelRequestRepo.findByIdAndUpdate({
      id: duelRequestId,
      update: { status: 'accepted' }
    })

    const contest = await this.contestRepo.findById({ id: duelRequest.contestId })
    if (!contest) throw new NotFoundException('Contest not found') //handle null

    // get challenger and challenged users
    const challenger = await this.userRepo.findById({ id: duelRequest.challengerId })
    const challenged = await this.userRepo.findById({ id: duelRequest.challengedId })


    // send to challenger
    sendEmail({
      to: challenger!.email as string,
      subject: '⚔️ Your Duel is Starting!',
      html: `
        <h1>Hello ${challenger?.fullname}!</h1>
        <p>Your duel against <strong>${challenged?.fullname}</strong> starts on: <strong>${contest?.startTime}</strong></p>
        <p>Good luck! ⚔️</p>
      `
    }).catch(err => console.error('Email failed:', err));

    // send to challenged
    await sendEmail({
      to: challenged?.email as string,
      subject: '⚔️ You Have Been Challenged!',
      html: `
        <h1>Hello ${challenged?.fullname}!</h1>
        <p>You are being challenged by <strong>${challenger?.fullname}</strong> on: <strong>${contest?.startTime}</strong></p>
        <p>Good luck! ⚔️</p>
      `
    })


    //sending reminder emails to participants 15 minutes before the contest starts
    const reminderTime = new Date(contest.startTime.getTime() - 15 * 60 * 1000)

    const job = new CronJob(reminderTime, async () => {
      // send to challenger
      await sendEmail({
        to: challenger!.email as string,
        subject: '⚔️ Your Duel is Starting!',
        html: `
        <h1>Hello ${challenger?.fullname}!</h1>
        <p>Your duel against <strong>${challenged?.fullname}</strong> starts in 15 minutes! 💪</p>
        <p>Good luck! ⚔️</p>
      `
      })

      // send to challenged
      await sendEmail({
        to: challenged!.email as string,
        subject: '⚔️ You Have Been Challenged!',
        html: `
        <h1>Hello ${challenged?.fullname}!</h1>
        <p>Your duel against <strong>${challenger?.fullname}</strong> starts in 15 minutes! 💪</p>
        <p>Good luck! ⚔️</p>
      `
      })
    })

    this.schedulerRegistry.addCronJob(`reminder-${contest['_id']}`, job)
    job.start()

    return true
  }

  async rejectDuelRequest(user: any, duelRequestId: string) {
    // 1. find duel request
    const duelRequest = await this.duelRequestRepo.findById({ id: duelRequestId })
    if (!duelRequest) throw new NotFoundException('Duel request not found')

    // 2. check user is the challenged one
    if (duelRequest.challengedId.toString() !== user._id.toString())
      throw new ForbiddenException('You are not the challenged user')

    // 3. check request is pending
    if (duelRequest.status !== 'pending')
      throw new BadRequestException('Duel request is no longer pending')

    // 4. update request status only
    await this.duelRequestRepo.findByIdAndUpdate({
      id: duelRequestId,
      update: { status: 'rejected' }
    })

    //send email to challenger
    const challenger = await this.userRepo.findById({ id: duelRequest.challengerId })
    await sendEmail({
      to: challenger!.email as string,
      subject: '⚔️ Your Duel Request Was Rejected!',
      html: `
        <h1>Hello ${challenger?.fullname}!</h1>
        <p>Your duel request against <strong>${user.fullname}</strong> has been rejected 😔</p>
      `
    })

    //delete from duel request
    await this.duelRequestRepo.deleteOne({ filter: { _id: duelRequestId } })
    return true
  }
}