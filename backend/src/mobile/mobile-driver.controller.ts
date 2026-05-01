import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { getAuthenticatedUser } from '../common/auth/auth-request.js';
import { SupabaseAuthGuard } from '../common/auth/supabase-auth.guard.js';
import type { UploadedFileFields } from './mobile-upload.types.js';
import { MOBILE_PREFIX } from './mobile.utils.js';
import { MobileDriverService } from './mobile-driver.service.js';

@Controller(`${MOBILE_PREFIX}/driver`)
@UseGuards(SupabaseAuthGuard)
export class MobileDriverController {
  constructor(private readonly driverService: MobileDriverService) {}

  @Get('profile')
  getProfile(@Req() request: Request) {
    return this.driverService.getProfile(getAuthenticatedUser(request));
  }

  @Patch('profile')
  updateProfile(
    @Req() request: Request,
    @Body() body: Record<string, unknown>,
  ) {
    return this.driverService.updateProfile(
      getAuthenticatedUser(request),
      body,
    );
  }

  @Patch('profile/online-status')
  updateOnlineStatus(
    @Req() request: Request,
    @Body() body: Record<string, unknown>,
  ) {
    return this.driverService.updateOnlineStatus(
      getAuthenticatedUser(request),
      body,
    );
  }

  @Post('profile/documents')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'license', maxCount: 1 },
      { name: 'registration', maxCount: 1 },
    ]),
  )
  uploadDocuments(
    @Req() request: Request,
    @UploadedFiles() files: UploadedFileFields | undefined,
  ) {
    return this.driverService.uploadDocuments(
      getAuthenticatedUser(request),
      files,
    );
  }

  @Get('jobs')
  listJobs(@Req() request: Request, @Query('status') status?: string) {
    return this.driverService.listJobs(getAuthenticatedUser(request), status);
  }

  @Get('jobs/:jobId')
  getJob(@Req() request: Request, @Param('jobId') jobId: string) {
    return this.driverService.getJob(getAuthenticatedUser(request), jobId);
  }

  @Post('jobs/:jobId/accept')
  acceptJob(@Req() request: Request, @Param('jobId') jobId: string) {
    return this.driverService.acceptJob(getAuthenticatedUser(request), jobId);
  }

  @Post('jobs/:jobId/reject')
  rejectJob(
    @Req() request: Request,
    @Param('jobId') jobId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.driverService.rejectJob(
      getAuthenticatedUser(request),
      jobId,
      body,
    );
  }

  @Patch('jobs/:jobId/parcel-status')
  updateParcelStatus(
    @Req() request: Request,
    @Param('jobId') jobId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.driverService.updateParcelStatus(
      getAuthenticatedUser(request),
      jobId,
      body,
    );
  }

  @Get('earnings')
  getEarnings(@Req() request: Request, @Query('period') period?: string) {
    return this.driverService.getEarnings(
      getAuthenticatedUser(request),
      period,
    );
  }
}

@Controller('internal/driver')
export class InternalDriverController {
  constructor(private readonly driverService: MobileDriverService) {}

  @Get(':driverId/summary')
  getDriverSummary(@Param('driverId') driverId: string) {
    return this.driverService.getDriverSummary(driverId);
  }
}
