import { HardnessEnum } from "../enums/HardnessEnum"
import { UserLevels } from "../enums/LevelEnum"
import { Rank } from "../enums/RankEnum"

export const levelModifiers = {
  [UserLevels.beginner]: { multiplier: 1,   penalty: 0    },
  [UserLevels.Intermediate]: { multiplier: 2,   penalty: 0.20 },
  [UserLevels.Advanced]: { multiplier: 3,   penalty: 0.50 },
}

export const rankModifiers = {
  [Rank.beginner]: { multiplier: 1,   penalty: 0    },
  [Rank.bronze]:   { multiplier: 1.2, penalty: 0.10 },
  [Rank.silver]:   { multiplier: 1.4, penalty: 0.20 },
  [Rank.gold]:     { multiplier: 1.6, penalty: 0.30 },
  [Rank.legend]:   { multiplier: 1.8, penalty: 0.40 },
}

export const hardnessModifiers = {
  [HardnessEnum.easy]:   { bonus: 0, penalty: 1 },
  [HardnessEnum.medium]: { bonus: 2, penalty: 2 },
  [HardnessEnum.hard]:   { bonus: 3, penalty: 1 },
}

export const leaderboardModifiers = {
  1: 1.5,
  2: 1.4,
  3: 1.3,
}

export const calculateQuestionScore = (
  baseScore: number,
  userLevel: number,
  userRank: Rank,
  difficulty: string,
  isCorrect: boolean,
  leaderboardPosition?: number
): { gained: number, lost: number } => {

  const level = levelModifiers[userLevel]
  const rank  = rankModifiers[userRank]
  const hard  = hardnessModifiers[difficulty]

  if (isCorrect) {
    let score = baseScore
    score *= level.multiplier
    score *= rank.multiplier
    score += hard.bonus

    // leaderboard bonus applied at END of contest
    if (leaderboardPosition && leaderboardModifiers[leaderboardPosition]) {
      score = score * leaderboardModifiers[leaderboardPosition]
    }

    return { gained: Math.floor(score), lost: 0 }//Math.floor is used to round down to the nearest integer
  }

  else {
    let loss = baseScore * (level.penalty + rank.penalty) + hard.penalty
    
    return { gained: 0, lost: Math.floor(loss) }
  }
}