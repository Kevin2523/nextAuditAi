import type { Permission } from '../../enums/permission.enum';
import type { Role } from '../../enums/role.enum';

export interface AuthSessionClaims {
  sub: string;
  tenantId: string;
  role: Role;
  permissions: Permission[];
  plan?: string;
}
