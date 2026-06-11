import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common'
import { UserRepo } from 'src/Models/User/user.repo'
import { TokenService } from '../services/token.service'


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: TokenService,
    private readonly userRepo: UserRepo,

) {}

  async canActivate(context: ExecutionContext): Promise<boolean> { //ExecutionContext => includes the request and response objects, and other information about the current execution context.[wink]
      const req = context.switchToHttp().getRequest() // this line means get the request from the context and cast it to AuthReq type.
      const auth = req.headers.authorization
      if (!auth?.startsWith(process.env.BEARER as string)) {
        throw new BadRequestException('in-valid token')
      }  
      let payload: any
      let token: string 
     try {
      token = auth?.split(' ')[1]
      payload = this.jwtService.verify({
        token:token as string,
        options: {
          secret: process.env.JWT_SECRET
        }
      });
}catch (error) {
  if (error.name === 'TokenExpiredError') {
    throw new UnauthorizedException('Token expired');
  }
  throw new UnauthorizedException('Invalid token');
}

const user = await this.userRepo.findById({//here i'm not dealing with  database direct,  i'm dealing with the repo that call the DBService that  deal with the database.'wink'
  id: payload._id
});
//userRepo =>DBService =>mongoose =>mongodb native

if (!user) {
  throw new BadRequestException('in-valid token')
}
req.user=user 
return true//we must return boolen because 'canActivate' method return promise<boolen>,and to allow the request to proceed to the controller, if return false it will block the request and return 403 forbidden error.
}
  }