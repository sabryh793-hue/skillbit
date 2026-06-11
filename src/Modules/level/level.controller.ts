import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto, UpdateLevelDto } from './dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRoles } from 'src/common/enums/RolesEnum';
import { AuthGuard } from 'src/common/guards/auth.guard';


@Controller('levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Auth(UserRoles.Admin)
  @Post()
  async createLevel(@Body() dto: CreateLevelDto) {
    const level = await this.levelService.createLevel(dto);
    return { message: 'Level created successfully', level };
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllLevels() {
    const levels = await this.levelService.getAllLevels();
    return { message: 'Levels fetched successfully', levels };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getLevelById(@Param('id') id: string) {
    const level = await this.levelService.getLevelById(id);
    return { message: 'Level fetched successfully', level };
  }

    @UseGuards(AuthGuard)
    @Get('order/:order')
    async getLevelByOrder(@Param('order') order: number) {
      const level = await this.levelService.getLevelByOrder(order);
      return { message: 'Level fetched successfully', level };
 }

  @Auth(UserRoles.Admin)
  @Patch(':id')
  async updateLevel(@Param('id') id: string, @Body() dto: UpdateLevelDto) {
    const level = await this.levelService.updateLevel(id, dto);
    return { message: 'Level updated successfully', level };
  }

  @Auth(UserRoles.Admin)
  @Delete(':id')
  async deleteLevel(@Param('id') id: string) {
    const level = await this.levelService.deleteLevel(id);
    return { message: 'Level deleted successfully', level };
  }
}
