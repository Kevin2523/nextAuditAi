import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const Tenant = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest<{ user?: { tenantId?: string } }>();
  return request.user?.tenantId;
});
