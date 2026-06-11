import { Body, Controller, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { confirmEmailDto, forgotPasswordDto, googleLoginDto, loginDto, resendOtpDto, resetPasswordDto, signUpDto } from "./dto";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService:AuthService) {}
 
    @Post('signup')
    async signup(@Body()  dto:signUpDto)
        {
        const user= await this.authService.signUp(dto)
        return {message:'Account created successfully , Please confirm your email',data:user}
    }

    @Post('login')
    async login(@Body() loginDto: loginDto) {
      const { accessToken, refreshToken } = await this.authService.login(loginDto)
      return ({ accessToken ,refreshToken})
    }
    
    @Post('google-login')
    async googleLogin(@Body() dto:googleLoginDto) {
        const { accessToken, refreshToken } = await this.authService.googleLogin(dto) 
         return { accessToken, refreshToken }
    }

    @Post('confirm-email')
    async confirmEmail(@Body() dto:confirmEmailDto) {
        const result = await this.authService.confirmEmail(dto.email,dto.otp)
        return {message:'Email confirmed successfully',data:result}
    }

    @Throttle({ default: { limit: 3, ttl: 60 } }) // max 3 requests per 60 seconds
    @Post('resend-otp')
    async resendOtp(@Body() resendOtpDto:resendOtpDto) {
        await this.authService.resendOtp(resendOtpDto.email)
        return { message: 'OTP resent successfully, please check your email' }  
    }

    @Post('refresh')
     async refreshToken(@Headers('authorization') auth:string ) {
        const token = auth?.split(' ')[1]
        const result = await this.authService.refreshToken(token)
        return { message: 'Token refreshed successfully', data: result }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: forgotPasswordDto) {
       await this.authService.forgotPassword(body.email)
       return { message: 'OTP sent to your email' }
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: resetPasswordDto) {
       const { email, otp, newPassword } = resetPasswordDto
         await this.authService.resetPassword(email, otp, newPassword)
         return { message: 'Password reset successfully, you can now login' }
    }
}