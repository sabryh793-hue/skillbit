import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { compare, generateOTP, Hash, sendEmail, TokenService } from 'src/common';
import { UserRepo } from "src/Models/User/user.repo";
import { googleLoginDto, loginDto, signUpDto } from "./dto";
import { OAuth2Client } from "google-auth-library";
import { User } from "src/Models/User/user.schema";


@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly tokenService: TokenService,
  ) { }

 async signUp(dto: signUpDto) {
  const user = await this.userRepo.findByEmail(dto.email);
  if (user) {
    throw new ConflictException('User already exists');
  }

  const otp = generateOTP(6);

  const createdUser = await this.userRepo.create({
    fullname: dto.fullname,
    email: dto.email,
    password: await Hash(dto.password),
    role: dto.role,
    level: dto.level,
    isVerified: false,
    emailOtp: {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  sendEmail({
    to: dto.email,
    subject: 'OTP Request',
    html: `<h1>Hello ${createdUser.fullname}</h1>
           <p>Your OTP is: <strong>${otp}</strong></p>
           <p>This OTP will expire in 10 minutes.</p>`,
  }).catch(err => console.error('Email failed:', err));

  return {
    id: createdUser['_id'],
    fullname: createdUser.fullname,
    email: createdUser.email,
    role: createdUser.role,
  };
}
    //with google and github we will skip email verification and directly set isVerified to true
  async googleLogin(googleLoginDto: googleLoginDto) {
    //get data from request
    const { idToken } = googleLoginDto
    
    //verify the token with google
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    let ticket: any,payload:any
    try {
     ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID  // to ensure the token is meant for our app only and not some other app that also uses google login
    })    
     payload = ticket.getPayload()
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token')
    }
    
    //check if user already exists in our database
    let user:User | null = await this.userRepo.findByEmail(payload.email ?? '') // if payload.email is undefined use empty string to avoid error in findByEmail, and here if user not found it return null
   
    //generate accessToken and refreshToken for the user
    const accessToken = this.tokenService.sign(
      { _id: user?.['_id'], email: user?.email },
      { secret: process.env.JWT_SECRET, expiresIn: '3h' }
    )
    const refreshToken = this.tokenService.sign(
      { _id: user?.['_id'], email: user?.email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '4d' }
    )

    if (!user) {
      //SignUp with google data 
      //if not exist create new user with data from google and mark email as verified since google already verified it
      user = await this.userRepo.create({
        fullname: payload.name,
        email: payload.email,
        googleId: payload.sub,
        isVerified: true, // since google already verified the email
        role: 'user', // default role for google signups
        isFirstTime: true, // can be used to show onboarding or not
        userAgent: 'google', // to know that this user signed up with google and not local to avoid password requirement in user schema.
      })

      return {
        user,
        accessToken,
        refreshToken,
      }
    }

   
    return {
      accessToken,
      refreshToken,
    }
  }

  async confirmEmail(email: string, otp: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!user.emailOtp) {
  throw new BadRequestException('No OTP found')
}

if (user.emailOtp.expiresAt <  new Date(Date.now() + 10 * 60 * 1000)) {
  throw new BadRequestException('OTP expired, request a new one')
}

if (user.emailOtp.code !== otp) {
  throw new BadRequestException('Invalid OTP')
}

    await this.userRepo.Update({
      filter: { email },
      update: {
        $unset: { emailOtp: "" },
        isVerified: true
      }
    })

    return true
  }

  async login(dto: loginDto) {
    const user = await this.userRepo.findByEmail(dto.email)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.isVerified) {
     throw new BadRequestException({isVerified:user.isVerified,message: 'You should confirm your email first'})
    }

    if (!await compare(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = this.tokenService.sign(
      { _id: user['_id'], email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '3h' }
    )


    const refreshToken = this.tokenService.sign(
      { _id: user['_id'], email: user.email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '4d' }
    )

    return {
      accessToken,
      refreshToken,
    }
  }

  async resendOtp(email: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified')
    }

    const otp = generateOTP(6)

    sendEmail({
      to: user.email,
      subject: 'OTP Request',
      html: `<h1>Hello ${user.fullname}</h1>
             <p>Your OTP is: <strong>${otp}</strong></p>
             <p>This OTP will expire in 10 minutes.</p>`
 }).catch(err => console.error('Email failed:', err));

    await this.userRepo.Update({
      filter: { email },
      update: {
        emailOtp: {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // fresh 10 minutes
        }
      }
    })
    return true
  }

  async refreshToken(token: string) {
    const payload = this.tokenService.verify({
      token,
      options: { secret: process.env.JWT_REFRESH_SECRET }
    })
    const user = await this.userRepo.findById({ id: payload._id })
    if (!user) {
      throw new UnauthorizedException('Invalid token')
    }

    const accessToken = this.tokenService.sign(
      { _id: user['_id'], email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '3h' }
    )

    const refreshToken = this.tokenService.sign(
      { _id: user['_id'], email: user.email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '4d' }
    )

    return { accessToken, refreshToken }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const otp = generateOTP(6)

    sendEmail({
      to: email,
      subject: 'Reset Password',
      html: `<h1>Hello ${user.fullname}</h1> 
                 <p>Your reset password OTP is: <strong>${otp}</strong></p>
                 <p>This OTP will expire in 10 minutes.</p>`
   }).catch(err => console.error('Email failed:', err));

    //update user with new otp and set it expires in 10 minutes
    await this.userRepo.Update({
      filter: { email },
      update: {
        emailOtp: {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      }
    })

    return true
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    if (!user.emailOtp || user.emailOtp.expiresAt < new Date() || user.emailOtp.code !== otp) {
      throw new BadRequestException('OTP expired, request a new one')
    }

    const isSamePassword = await compare(newPassword, user.password)
    if (isSamePassword) {
      throw new BadRequestException('New password cannot be same as old password')
    }
    await this.userRepo.Update(
      {
        filter: { email },
        update: {
          $unset: {
            emailOtp: ""
          },
          password: await Hash(newPassword)
        }
      })
    return true
  }
}