import { IsNotEmpty, IsString } from "class-validator";

export class SendDuelRequestDto {
    @IsNotEmpty()
    @IsString()
    contestId: string

    @IsNotEmpty()
    @IsString()
    challengedId: string

    @IsNotEmpty()
    @IsString()
    challengerId: string
}