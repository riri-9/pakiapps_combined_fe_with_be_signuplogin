import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from '../../supabase/supabase.service.js';
import { isUserRole, type AuthenticatedUser } from './authenticated-user.js';
import type { AuthenticatedRequest } from './auth-request.js';

function getBearerToken(request: Request): string {
  const authorization = request.get('authorization');

  if (!authorization) {
    throw new UnauthorizedException('Authorization bearer token is required.');
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    throw new UnauthorizedException(
      'Authorization header must use Bearer auth.',
    );
  }

  return match[1].trim();
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = getBearerToken(request);
    const supabase = this.supabaseService.createServerClient();

    const userResult = await supabase.auth.getUser(token);
    if (userResult.error || !userResult.data.user) {
      throw new UnauthorizedException('Invalid or expired bearer token.');
    }

    const authUser = userResult.data.user;
    const metadata = authUser.user_metadata as Record<string, unknown>;
    const role = getMetadataString(metadata, 'role');

    if (!isUserRole(role)) {
      throw new ForbiddenException(
        'Authenticated profile role is not supported.',
      );
    }

    request.user = {
      userId: authUser.id,
      role,
      fullName:
        getMetadataString(metadata, 'full_name') ??
        getMetadataString(metadata, 'fullName'),
      email: authUser.email ?? null,
      phone:
        getMetadataString(metadata, 'phone') ??
        getMetadataString(metadata, 'mobile'),
    } satisfies AuthenticatedUser;

    return true;
  }
}
