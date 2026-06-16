import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config'
import cors from "cors"
import { LoggingInterceptor } from './common/interceptors/watchRequest.interceptor';
import path from 'path';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
   // logger: ['error', 'warn', 'debug'],//it will only log error, warn and debug messages. It will not log any other messages like verbose and log messages. This is useful to reduce the amount of logs in production environment.

  })

  /*
  SOLID PRINCIPLES
  #S - Single Responsibility Principle:This means that a class should have only one responsibility. This makes the code more maintainable and easier to understand.
  #O - Open Close Principle: A class should be open for extension but closed for modification. This means that a class should be designed in such a way that it can be extended without modifying the existing code. This makes the code more maintainable and easier to understand.
  #L - Liskov Substitution Principle: Subtypes must be substitutable for their base types. This means that a subclass should be able to replace its superclass without affecting the correctness of the program. This makes the code more maintainable and easier to understand.
  #I - Interface Segregation Principle: Clients should not be forced to depend on interfaces they do not use. This means that a class should not implement an interface that it does not use. This makes the code more maintainable and easier to understand.
  #D - Dependency Inversion Principle: High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions. This means that a class should depend on abstractions rather than concrete implementations. This makes the code more maintainable and easier to understand.
  */
 
  const port = Number(process.env.PORT || 7000)//number because process.env.PORT is string and app.listen need number.
  
  app.use("/uploads", express.static(path.resolve("./uploads"))) //It is a middleware that is used to serve the files that are uploaded by the user.[static used to show the files when browser ask for it.]//👉 بيفتح الفولدر كله public, يعني أي حد يعرف path يقدر يوصله
   
 app.use(cors({
   origin:true, 
    credentials: true, // allow cookies to be sent with requests
  }))

   app.useGlobalPipes(//validation pipe is used to validate the incoming request body and query params before it reaches the controller. It can be used to validate the data and throw an error if the data is invalid.
     new ValidationPipe({
       whitelist: true,//if true it will remove any properties that are not defined in the DTO (Data Transfer Object) class. If false it will allow any properties that are not defined in the DTO class.
       forbidNonWhitelisted: false,//if true it will throw an error if there are any properties that are not defined in the DTO class. If false it will allow any properties that are not defined in the DTO class.
     //transform: true,//if true it will transform the incoming request body and query params to the DTO class. If false it will not transform the incoming request body and query params to the DTO class.
     }),
   )

  //app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(port, '0.0.0.0');
  }

void bootstrap()//It is used to avoid the warning "Function has no return type but is not a void function." in TypeScript.so this is a way to tell TypeScript that this function does not return anything.