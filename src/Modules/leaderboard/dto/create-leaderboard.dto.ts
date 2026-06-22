import { IsString } from "class-validator"

export class CreateLeaderboardDto {
    @IsString()
    contestId: string
}
