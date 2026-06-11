import {IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";
import { UserLevels, UserRoles } from "src/common";


export class signUpDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    fullname:string;

    @IsString()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    password:string;

    @IsNotEmpty()
    confirmPassword:string;

    @IsString()
    @IsIn(Object.values(UserRoles)) // Ensure role is one of the allowed values
    role:string;

    @IsString()
    @IsOptional()
    @IsIn(Object.values(UserLevels)) // Ensure level is one of the allowed values
    level?:string;
     
}

export class googleLoginDto {
    @IsString()
    @IsNotEmpty()
    idToken:string;   
}

export class googleSignUpDto {
    @IsString()
    @IsNotEmpty()
    fullname:string;

    @IsString()
    @IsEmail()
    email:string;   

    @IsString()
    @IsNotEmpty()
    googleId:string;

    @IsString()
    @IsIn(Object.values(UserRoles)) // Ensure role is one of the allowed values
     role:string;

    @IsNotEmpty()
    isFirstTime:boolean;
}

export class confirmEmailDto {
    @IsString()
    @IsEmail()
    email:string;

    @IsString()
    @IsNotEmpty()
    otp:string;
}

export class loginDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsStrongPassword()
    @IsNotEmpty()
    password:string;
}
 
export class resendOtpDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;
}

export class forgotPasswordDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;
}   

export class resetPasswordDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;
    
    @IsString()
    @IsNotEmpty()
    otp:string;

    @IsStrongPassword()
    @IsNotEmpty()
    newPassword:string;
}