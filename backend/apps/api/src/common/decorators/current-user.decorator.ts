import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
  displayName?: string;
  permissions?: string[];
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUser | undefined => {
  const request = ctx.switchToHttp().getRequest<{ user?: CurrentUser }>();
  return request.user;
});
