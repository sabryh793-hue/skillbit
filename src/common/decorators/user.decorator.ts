import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//createParamDecorator => Used to make custom decorator.
//ExecutionContext => Contains info about current request[Like: request , response , handler , class]

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {//data Optional value passed into decorator. Example: @User('id')//ctx Contains request context
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
  
    return data ? user?.[data] : user;//if data is provided it will return the user's property with that name, otherwise it will return the whole user object
  },
);
