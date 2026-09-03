import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface AuthenticatedUser {
  id: string;
  role: string;
  phone: string;
}

/**
 * @CurrentUser() user: AuthenticatedUser
 * Extrait l'utilisateur authentifié injecté par JwtStrategy dans req.user.
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
