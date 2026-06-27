import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadgeService } from './badges.service';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgeService: BadgeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' must match the Postman key
  async createBadgeWithImage(@Body() data: {
    name:string,
    description:string,
    minimumScore:number,
  },
    @UploadedFile() file: Express.Multer.File,
   
  ) {
    //return this.badgeService.createBadge(file, date);
  }

  @Post('assign')
  async assignBadges(
    @Body() body: { userIds: string[]; badgeIds: string[] }
  ) {
    return this.badgeService.addBadgesToUsers(body.userIds, body.badgeIds);
  }
}