import { Reflector } from "@nestjs/core";
import { SetMetadata } from "@nestjs/common";


// export const Roles = Reflector.createDecorator<string[]>()
// Roles(['admin','user'])
//Roles => became a decorator function that can be used to set metadata on a class or method. The metadata is an array of strings representing the roles that are allowed to access the decorated class or method.


export const Roles = (...roles: string[]) => SetMetadata('roles', roles);  