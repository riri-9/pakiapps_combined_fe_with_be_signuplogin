import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAuthenticatedUser } from '../common/auth/auth-request.js';
import { SupabaseAuthGuard } from '../common/auth/supabase-auth.guard.js';
import { MOBILE_PREFIX } from './mobile.utils.js';
import { MobileParcelsService } from './mobile-parcels.service.js';

@Controller(`${MOBILE_PREFIX}/parcels`)
@UseGuards(SupabaseAuthGuard)
export class MobileParcelsController {
  constructor(private readonly parcelsService: MobileParcelsService) {}

  @Post()
  create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    return this.parcelsService.createParcel(
      getAuthenticatedUser(request),
      body,
    );
  }

  @Get()
  list(
    @Req() request: Request,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.parcelsService.listParcels(
      getAuthenticatedUser(request),
      status,
      page,
      limit,
    );
  }

  @Get(':id')
  getOne(@Req() request: Request, @Param('id') parcelId: string) {
    return this.parcelsService.getParcel(
      getAuthenticatedUser(request),
      parcelId,
    );
  }

  @Patch(':id/cancel')
  cancel(
    @Req() request: Request,
    @Param('id') parcelId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.parcelsService.cancelParcel(
      getAuthenticatedUser(request),
      parcelId,
      body,
    );
  }

  @Post(':id/review')
  review(
    @Req() request: Request,
    @Param('id') parcelId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.parcelsService.reviewParcel(
      getAuthenticatedUser(request),
      parcelId,
      body,
    );
  }
}
