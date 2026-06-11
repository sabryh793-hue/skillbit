import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class updateProfileDto {
  @IsOptional()
  @IsString()
  fullname?: string

  @IsOptional()
  @IsString()
  profilePicture?: string

}

export class changePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @IsString()
  @IsNotEmpty()
  newPassword: string
}