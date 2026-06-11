import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRepo } from "src/Models/User/user.repo";
import { User, UserSchema } from "../../Models/User/user.schema"
import { TokenService } from "src/common/services/token.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";



@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // Load .env file and make it available globally
        MongooseModule.forFeature([{
             name: User.name, schema: UserSchema
        }]),
    ],
    controllers: [AuthController],
    providers: [AuthService,UserRepo,JwtService,TokenService,JwtService]
})

export class AuthModule {}