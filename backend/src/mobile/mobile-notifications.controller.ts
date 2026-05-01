import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { getAuthenticatedUser } from '../common/auth/auth-request.js';
import { SupabaseAuthGuard } from '../common/auth/supabase-auth.guard.js';
import { MOBILE_PREFIX } from './mobile.utils.js';
import { MobileNotificationsService } from './mobile-notifications.service.js';

@Controller(`${MOBILE_PREFIX}/notifications`)
@UseGuards(SupabaseAuthGuard)
export class MobileNotificationsController {
  constructor(
    private readonly notificationsService: MobileNotificationsService,
  ) {}

  @Get()
  list(@Req() request: Request) {
    return this.notificationsService.list(getAuthenticatedUser(request));
  }

  @Patch(':id/read')
  markRead(@Req() request: Request, @Param('id') notificationId: string) {
    return this.notificationsService.markOneRead(
      getAuthenticatedUser(request),
      notificationId,
    );
  }
}
