import { Injectable } from "@nestjs/common"
import { BadgeRepo } from "src/Models/Badges/badge.repo"
import { ContestResultRepo } from "src/Models/Contests/cotest.result.repo"
import { LeaderboardRepo } from "src/Models/Leaderboard/leaderboard.repo."
import { UserRepo } from "src/Models/User/user.repo"


@Injectable()
export class LeaderboardService {
  constructor(
    private readonly leaderboardRepo: LeaderboardRepo,
    private readonly contestResultRepo: ContestResultRepo,
    private readonly userRepo: UserRepo,
    private readonly badgeRepo: BadgeRepo,
  ) {}


  // called after each contest ends
  async updateLeaderboard(contestId: string) {
    // 1. get all results for this contest sorted by score
    const results = await this.contestResultRepo.find(
      { contestId: contestId as any },
      {},
      { sort: { score: -1, timeTaken: 1 } }
    )
  //handle ties
  // if two users have same score, they should have same rank

    // 2. update leaderboard for each participant
    await Promise.all(
      results.map(async (result, index) => {
        const rank = index + 1 
      
        // get user's current badge
        const user = await this.userRepo.findById({
          id: result.userId,
          projection: { score: 1, fullname: 1, profilePicture: 1 }
        })
        if (!user) return
      
        // get highest badge
        const badge = await this.badgeRepo.findOne({
          filter: { minimumScore: { $lte: user.score } },//minimum score of badge is less than user score
          options: { sort: { minimumScore: -1 } }//sort by minimum score in descending order
        })

        // upsert leaderboard entry
        await this.leaderboardRepo.findOneAndUpdate({
          filter: { userId: result.userId },
          update: {
            userId: result.userId,
            score: user.score,
            rank,
            badgeId: badge ? badge['_id'] : null,
            updatedAt: new Date()
          },
          options: { upsert: true, new: true }
        })
      })
    )
  }

  // get leaderboard — Flutter calls this
  async getLeaderboard() {
    const leaderboard = await this.leaderboardRepo.find(
      {},
      {},
      { sort: { score: -1 } }
    )

    // populate user and badge data
    const result = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await this.userRepo.findById({
          id: entry.userId,
          projection: { fullname: 1, profilePicture: 1 }
        })

        const badge = entry.badgeId
          ? await this.badgeRepo.findById({ id: entry.badgeId })
          : null

        return {
          rank: entry.contestRank,
          fullname: user?.fullname,
          profilePicture: user?.profilePicture,
          score: entry.score,
          badge: badge ? {
            name: badge.name,
            iconUrl: badge.iconUrl
          } : null
        }
      })
    )

    return result
  }
}