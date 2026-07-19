import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): Omit<User, 'password'> => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
