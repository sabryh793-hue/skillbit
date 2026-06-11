import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepo } from "src/Models/User/user.repo";
import { TokenService } from "src/common";
import { JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/Models/User/user.schema";
import { MulterModule } from "@nestjs/platform-express";



@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ])
    ],
    controllers: [UserController],
    providers: [
        UserService,
        TokenService,
        UserRepo,
        JwtService
    ],
})
export class UserModule {}