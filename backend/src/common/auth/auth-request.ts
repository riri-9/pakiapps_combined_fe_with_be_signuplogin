import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from './authenticated-user.js';

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export function getAuthenticatedUser(request: Request): AuthenticatedUser {
  const user = (request as AuthenticatedRequest).user;

  if (!user) {
    throw new UnauthorizedException('Authenticated user is required.');
  }

  return user;
}
