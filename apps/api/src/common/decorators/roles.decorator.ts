import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@khedmati/database";

export const ROLES_KEY = "roles";

/**
 * @Roles(UserRole.ADMIN, UserRole.OPERATOR)
 * Restreint un endpoint aux rôles listés. Combiné à RolesGuard.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
