import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './role.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/roles.guard';

export function Auth(...roles: string[]) {//..roles => it can take any number of arguments, for example => Auth('user', 'admin') or Auth() or Auth('user', 'admin', 'mentor') etc
    return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RoleGuard));
}//this is a custom decorator that combines the functionality of both AuthGuard and RoleGuard. It takes in an array of roles as arguments and applies the Roles decorator to set the required roles for the route, and also applies the AuthGuard and RoleGuard to protect the route.

Auth('user', 'admin'); // This is how you would use the Auth decorator in a controller. It will ensure that only users with the 'user' or 'admin' role can access the route.