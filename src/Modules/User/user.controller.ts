import { Body, Controller, Delete, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth, AuthGuard, Roles, UserRoles } from "src/common";
import { changePasswordDto, updateProfileDto } from "./dto";
import type { AuthReq } from "src/common/AuthReq";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { localFileUpload } from "src/common/utils/multer/localMulter";
import type { IMulterFile } from "src/common/interfaces/multerInterface";
import { fileValidation } from "src/common/utils/multer/validationMulter";
import { cloudMulterConfig } from "src/common/utils/multer";
import { StorageEnum } from "src/common/enums/multer.enum";


@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
    constructor(private  readonly userService: UserService) {}

    @Get('my-profile')
    async getMyProfile(@Req() req: AuthReq) {
     const user = await this.userService.getMyProfile(req.user['_id'])
     return { message: 'Profile fetched successfully', data: user }
}

    @Get('profile/:id')
    async getUserProfile(@Param('id') userId: string) {
     const user = await this.userService.getUserProfile(userId)
     return { message: 'Profile fetched successfully', data: user }
}
    
   @Patch('update-profile')
     async updateProfile(@Req() req: AuthReq, @Body() updateProfileDto: updateProfileDto) {
     const user = await this.userService.updateProfile(req.user['_id'], updateProfileDto)
     return { message: 'Profile updated successfully', data: user }
}

    @Delete('delete')
       async deleteUser(@Req() req: AuthReq) {
        await this.userService.deleteUser(req.user['_id'])
        return { message: 'User deleted successfully' }
        }
    
    @Patch('change-password')
    async changePassword(@Req() req: AuthReq, @Body() changePasswordDto: changePasswordDto) {
        await this.userService.changePassword(req.user['_id'],changePasswordDto)//changePasswordDto holds oldPassword and newPassword
        return { message: 'Password changed successfully' }
    }  

   @Post('send-friend-request/:id')
   async sendFriendRequest(@Param('id') toId: string, @Req() req: AuthReq) {
     await this.userService.sendFriendRequest(req.user['_id'], toId)
     return { message: 'Friend request sent successfully' }
}

   @Patch('accept-friend-request/:id')
   async acceptFriendRequest(@Param('id') fromId: string, @Req() req: AuthReq) {
   await this.userService.acceptFriendRequest(req.user, fromId)
   return { message: 'Friend request accepted successfully' }
}
 
   @Patch('reject-friend-request/:id')
   async rejectFriendRequest(@Param('id') fromId: string, @Req() req: AuthReq) {
    await this.userService.rejectFriendRequest(req.user, fromId)
    return { message: 'Friend request rejected successfully' }
}

  @Delete('remove-friend/:id')
  async removeFriend(@Param('id') friendId: string, @Req() req: AuthReq) {
   await this.userService.removeFriend(req.user, friendId)
   return { message: 'Friend removed successfully' }
}

   @Get('friends')
   async getFriends(@Req() req: AuthReq) {
   const friends = await this.userService.getFriends(req.user['_id'])
   return { message: 'Friends fetched successfully', data: friends }
}
  
  @Auth(UserRoles.Admin)
  @Patch('upload-file')
  @UseInterceptors(FileInterceptor('file' , localFileUpload({ folder: 'avatar',validation:fileValidation.IMAGE ,maxSize:2 })))
  uploadFile(//no need of async and await here because file is already uploaded by multer
    @UploadedFile(
      new ParseFilePipe({
        validators:[new MaxFileSizeValidator({maxSize:1024*1024*2})],//runs before localFileUpload [that means validation.fileValidation.IMAGE will]
        fileIsRequired: true, // Ensure file is required
        
      })) file: IMulterFile) {
   
   
    return { message: 'File uploaded successfully', data: file }
}


   @Patch('cover-files')
   @UseInterceptors(FilesInterceptor(
    'coverImages',
    10,//max number of files to upload 
    localFileUpload({ folder: 'coverFiles',validation:fileValidation.IMAGE ,maxSize:2 })))
    uploadFiles(//no need of async and await here because file is already uploaded by multer
    @UploadedFiles(
      new ParseFilePipe({
        validators:[new MaxFileSizeValidator({maxSize:1024*1024*2})],//runs before localFileUpload [that means validation.fileValidation.IMAGE will]
        fileIsRequired: true, // Ensure file is required
        
      })) files:Array<IMulterFile>) {
   
   
    return { message: 'File uploaded successfully', data: files }
 }

  @Auth(UserRoles.Admin)
  @Patch('cloud-file')
  @UseInterceptors(FileInterceptor('file' , 
    cloudMulterConfig({storageApproach:StorageEnum.DISK,validation:fileValidation.IMAGE ,maxSize:2 })))
  uploadCloudFile(
    @UploadedFile(
      new ParseFilePipe({
        validators:[new MaxFileSizeValidator({maxSize:1024*1024*2})],//runs before localFileUpload [that means validation.fileValidation.IMAGE will]
        fileIsRequired: true, 
        
      })) file: IMulterFile) {
   
   
    return { message: 'File uploaded successfully', data: file }
}

  @UseGuards(AuthGuard)
  @Patch('upload-profile-picture')
  @UseInterceptors(FileInterceptor('image'))
 async uploadProfilePicture(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: AuthReq
) {
  const result = await this.userService.uploadProfilePicture(req.user['_id'], file)
  return { message: 'Profile picture uploaded successfully', data: result }
}
}