import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Auth, UserRoles } from 'src/common';
import { CreateAchievementDto, UpdateAchievementDto } from './dto';
import { AchievementService } from './achievement.service';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Auth(UserRoles.Admin)
  @Post('create')
  async createAchievement(@Body() dto: CreateAchievementDto) {
    const achievement = await this.achievementService.createAchievement(dto)
    return { message: 'Achievement created successfully', data: achievement }
  }

  @Post('seed')
  async seedAchievements(@Body() achievementsDto: CreateAchievementDto[]) {
    const achievement = await this.achievementService.seedData(achievementsDto);
    if(achievement === 1) return { message: 'Achievements already seeded' }
    return { message: 'Achievements seeded successfully', data: achievement }
  }

  @Auth(UserRoles.Admin)
  @Patch('update/:id')
  async updateAchievement(@Param('id') id: string, @Body() dto: UpdateAchievementDto) {
    const achievement = await this.achievementService.updateAchievement(id, dto)
    return { message: 'Achievement updated successfully', data: achievement }
  }

  @Auth(UserRoles.Admin)
  @Delete('delete/:id')
  async deleteAchievement(@Param('id') id: string) {
    await this.achievementService.deleteAchievement(id)
    return { message: 'Achievement deleted successfully' }
  }

  @Auth(UserRoles.Admin)
  @Get()
  async getAllAchievements() {
    const achievements = await this.achievementService.getAllAchievements()
    return { message: 'Achievements fetched successfully', data: achievements }
  }

  // @Auth(UserRoles.Admin)
  // @Post('award/:userId/:achievementName')
  // async awardAchievement(@Param('userId') userId: string, @Param('achievementName') achievementName: string) {
  //   await this.achievementService.awardAchievement(userId, achievementName)
  //   return { message: 'Achievement awarded successfully' }
  // }
}