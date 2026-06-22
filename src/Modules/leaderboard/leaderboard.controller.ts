import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardDto } from './dto/create-leaderboard.dto';
import { UpdateLeaderboardDto } from './dto/update-leaderboard.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post("update")
async updateLeaderboard(@Body() dto: UpdateLeaderboardDto) {
    await this.leaderboardService.updateLeaderboard(dto.contestId);
    return {message: "Leaderboard updated successfully"}
  }

  @Get()
  async getLeaderboard() {
    const leaderboard = await this.leaderboardService.getLeaderboard();
    return {message: "Leaderboard fetched successfully", leaderboard}
  }
 
}
