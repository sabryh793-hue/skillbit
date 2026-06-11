import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  iconUrl: string;

  @IsNumber()
  @IsNotEmpty()
  xpReward: number;
}
