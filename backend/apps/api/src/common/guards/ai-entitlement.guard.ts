import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class AiEntitlementGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: Role } }>();
    const role = request.user?.role;

    if (role === Role.Admin || role === Role.SuperAdmin) return true;

    throw new ForbiddenException('AI usage is not available for this role.');
  }
}
