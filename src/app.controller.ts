import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, Redirect, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get() //act as api [method=>GET, url=>'/']
  getHello(): string {
   //return 'hi from nestjs';
   return this.appService.getHello();
  }

  /*
  @Post('signup') //defualt statues code for post method is 201 but we can change it by using @HttpCode() decorator
//@HttpCode(200)
  signUp(
    //@Req() req: Request{//@Req() is a decorator that allows nestjs to understand that we want to access the request object in our controller method.but the [:Request] it's a type annotation that specifies the type of the req parameter as Request. This is useful for type checking and autocompletion in TypeScript.
    @Query('id',ParseIntPipe) id: number
  ) {
    console.log(typeof id); //number
    return {message: "User signed up successfully", success: true};
  }
*/
/* 
@Get('redirect')
  @Redirect('https://www.google.com') 
  redirect() {
    return {message: "Redirecting to another page", success: true};
  }
    */
}