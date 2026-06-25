import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common'; 
import { ContestService } from './contest.service'; 
import { CreateContestDto } from './dto/create-contest.dto';
import { Auth, AuthGuard, UserRoles } from 'src/common';
import type { AuthReq } from 'src/common/AuthReq';
import { SubmitContestDto } from './dto/submitContestDto';
import { User } from 'src/common/decorators/user.decorator';


@Controller('contest')
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  // Global Contest
  @Auth(UserRoles.Admin) 
  @Post('create')
  async createContest(@Body() dto: CreateContestDto) {
    const data=await this.contestService.createContest(dto)
    return { message: 'Contest created successfully',data }
  }

  @UseGuards(AuthGuard)
  @Get('details')
  async contestDetailsOfUser(@User('id') userId: string ){
    const data= await this.contestService.contestDetailsOfUser(userId)
    return { message: 'Contest details fetched successfully',data } 
  } 

  @UseGuards(AuthGuard)
  @Post('join/:id')
  async joinContest(@Param('id') contestId: string, @Req() req: AuthReq) {
    await this.contestService.joinContest(req.user, contestId)
    return { message: 'Joined contest successfully' }
  }

  
  @Auth(UserRoles.Admin) 
  @Post('start/:id')
  async startContest(@Param('id') contestId: string) {
    const questions = await this.contestService.startContest( contestId)
    return { message: 'Contest started successfully',data: questions }
  }
  

  @UseGuards(AuthGuard)
  @Post('submit')
  async submitContest(
    @Body() dto: SubmitContestDto,
    @Req() req: AuthReq
  ) {
    const result = await this.contestService.submitContest(req.user,dto)
    return { message: 'Contest submitted successfully', data: result }
  }


  @UseGuards(AuthGuard)
  @Get('answers/:id')
  async getContestAnswers(@Param('id') contestId: string,@User('id') userId: string) {
    const result = await this.contestService.getContestAnswers(userId, contestId)
    return { message: 'Answers fetched successfully', data: result }
  }

  @UseGuards(AuthGuard)
  @Get('results/:id')
  async getContestResults(@Param('id') contestId: string, @User('id') userId: string) {
    const result = await this.contestService.getContestResults(userId, contestId)
    return { message: 'Results fetched successfully', data: result }
  }


  
  // Duel Contest
  @UseGuards(AuthGuard)
  @Post('duel/send/:id')
  async sendDuelRequest(
    @Param('id') challengedId: string,
    @Req() req: AuthReq
  ) {
    const duel = await this.contestService.sendDuelRequest(req.user, challengedId)
    return { message: 'Duel request sent successfully', data: duel }
  }

  @UseGuards(AuthGuard)
  @Patch('duel/accept/:id')
  async acceptDuelRequest(@Param('id') duelRequestId:string , @Req() req: AuthReq) {
    await this.contestService.acceptDuelRequest(req.user, duelRequestId)
    return { message: 'Duel accepted successfully' }
  }

  @UseGuards(AuthGuard)
  @Patch('duel/reject/:id')
  async rejectDuelRequest(@Param('id') duelRequestId: string, @Req() req: AuthReq) {
    await this.contestService.rejectDuelRequest(req.user, duelRequestId)
    return { message: 'Duel rejected successfully' }
  }

}