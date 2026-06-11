import { Injectable } from '@nestjs/common'
import {
  JwtService ,
  JwtSignOptions,
  JwtVerifyOptions,
} from '@nestjs/jwt'

@Injectable() 
//here i used it in class not a func. because i wanna to use constructor to inject the JwtService from @nestjs/jwt and use it in the methods of this class. if i used it as a func. i can't do this.
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: any, options?: JwtSignOptions){
    const token = this.jwtService.sign(payload, options || {})
    return token
  }

  verify({ token, options }: { token: string; options: JwtVerifyOptions }) {
    const result = this.jwtService.verify(token, options)
    return result
  }
}