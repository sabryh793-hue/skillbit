import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserRepo } from "src/Models/User/user.repo"; 
import { changePasswordDto, updateProfileDto } from "./dto";
import { compare, Hash } from "src/common";
import { uploadToCloudinary } from "src/common/utils/cloudinary";

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepo) {}
  

  async getMyProfile(userId: string) {
  const user = await this.userRepo.findById({ 
    id: userId,
    projection: { password: 0, emailOtp: 0 }
  })

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return user
}
  async getUserProfile(userId: string) {
  const user = await this.userRepo.findById({
    id: userId,
    projection: { 
      fullname: 1, 
      profilePicture: 1, 
      score: 1, 
      earnedBadges: 1 
  }
  })

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return user
}
  async updateProfile(userId: string, updateProfileDto: updateProfileDto) {
  const user = await this.userRepo.findByIdAndUpdate({
    id: userId,
    update: updateProfileDto,// This will only update the fields that are present in the updateProfileDto
    options: { new: true, projection: { password: 0, emailOtp: 0 } }// This will return the updated user document and exclude the password and emailOtp fields from the result
  })

  if (!user) {
    throw new NotFoundException('User not found')
  }

  return user
}
  async deleteUser(userId: string) {
  const user = await this.userRepo.findByIdAndDelete({ id: userId })

  if (!user) {
    throw new NotFoundException('User not found')
  }
}
 async changePassword( userId: string ,changePasswordDto: changePasswordDto) {
  const { oldPassword, newPassword } = changePasswordDto

  const user = await this.userRepo.findById({ id: userId})

  if (!user) {
    throw new NotFoundException('User not found')
  }

  const isMatch = await compare(oldPassword, user.password)
  if (!isMatch) {
    throw new UnauthorizedException('Invalid credentials')
  }

  const isSamePassword = await compare(newPassword, user.password)
  if (isSamePassword) {
    throw new BadRequestException('New password cannot be same as old password')
  }

  await this.userRepo.findByIdAndUpdate({
    id: userId,
    update: { password: await Hash(newPassword) },
  })

  return true
}
 async sendFriendRequest(fromId: string, toId: string) {
  if (toId.toString() === fromId.toString()) {
    throw new BadRequestException('You cannot send a friend request to yourself')
  }

  const toUser = await this.userRepo.findById({ id: toId })
  if (!toUser) {
    throw new NotFoundException('User not found')
  }

  const alreadySent = toUser.friendRequests.find((req) => req.from.toString() === fromId.toString())//toString is used to convert the ObjectId to string for comparison

  if (alreadySent) {
    throw new BadRequestException('Friend request already sent')
  }

  const alreadyFriends = toUser.friends.find((friend) => friend.toString() === fromId.toString())
  if (alreadyFriends) {
    throw new BadRequestException('You are already friends')
  }

  await this.userRepo.findByIdAndUpdate({
    id: toId,
    update: {
      $push: { friendRequests: { from: fromId } }
    }
  })

  return true
}
async acceptFriendRequest(user: any, fromId: string) {
  const request = user.friendRequests.find((req) => req.from.toString() === fromId.toString())

  if (!request) {
    throw new NotFoundException('Friend request not found')
  }

  await this.userRepo.findByIdAndUpdate({
    id: user._id,
    update: {
      $pull: { friendRequests: { from: fromId } },
      $push: { friends: fromId }
    }
  })

  await this.userRepo.findByIdAndUpdate({
    id: fromId,
    update: { $push: { friends: user._id } }
  })

  return true
}
 async rejectFriendRequest(user: any, fromId: string) {
  const request = user.friendRequests.find((req) => req.from.toString() === fromId.toString())

  if (!request) {
    throw new NotFoundException('Friend request not found')
  }

  await this.userRepo.findByIdAndUpdate({
    id: user._id,
    update: {
      $pull: { friendRequests: { from: fromId } }
    }
  })

  return true
}
 async removeFriend(user: any, friendId: string) {

  const isFriend = user.friends.find((friend) => friend.toString() === friendId.toString())
  
  if (!isFriend) {
    throw new NotFoundException('Friend not found')
  }

  await this.userRepo.findByIdAndUpdate({
    id: user._id,
    update: { $pull: { friends: friendId } }
  })

  await this.userRepo.findByIdAndUpdate({
    id: friendId,
    update: { $pull: { friends: user._id } }
  })

  return true
}
  async getFriends(userId: string) {
  const me = await this.userRepo.findById({
    id: userId,
    options: { 
      populate: { 
        path: 'friends', 
        select: 'fullname profilePicture score' 
      } 
  }
  })

  return me
}
async uploadProfilePicture(userId: string, file: Express.Multer.File) {
  const result: any = await uploadToCloudinary(file, 'profile-pictures')
  
  await this.userRepo.findByIdAndUpdate({
    id: userId,
    update: { profilePicture: result.secure_url }
  })

  return { profilePicture: result.secure_url }
}

//get courses progress


//get 12 months of contest score of user


}