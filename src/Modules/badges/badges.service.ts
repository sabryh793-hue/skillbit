import { Injectable } from '@nestjs/common';
import { uploadToCloudinary } from 'src/common/utils/cloudinary';
import { BadgeRepo } from 'src/Models/Badges/badge.repo';
import { UserRepo } from 'src/Models/User/user.repo';

@Injectable()
export class BadgeService {
  constructor(
    private readonly badgeRepo: BadgeRepo,
    private readonly userRepo: UserRepo,
  ) {}

  async createBadge(file: Express.Multer.File, data: any) {
    // 1. Upload the image to Cloudinary using YOUR existing function
    const cloudinaryResult: any = await uploadToCloudinary(file, 'badges');

    // 2. Create the new badge document with the REAL URL from Cloudinary
    const newBadge = await this.badgeRepo.create({
      name: data.name,
      description: data.description,
      minimumScore: data.minimumScore,
      iconUrl: cloudinaryResult.secure_url, // <-- This is the magic line!
    });
    return newBadge;
  }

  async addBadgesToUsers(userIds: string[], badgeIds: string[]) {
    const results = [];
    for (const userId of userIds) {
      const updatedUser = await this.userRepo.findByIdAndUpdate({
        id: userId,
        update: {
          $addToSet: { earnedBadges: { $each: badgeIds } }
        },
        options: { new: true }
      });
      results.push(updatedUser);
    }
    return results;
  }
}