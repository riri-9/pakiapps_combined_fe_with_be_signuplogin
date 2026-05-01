import {
  Body,
  Controller,
  Get,
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
import { MobileOperatorService } from './mobile-operator.service.js';

@Controller(`${MOBILE_PREFIX}/operator`)
@UseGuards(SupabaseAuthGuard)
export class MobileOperatorController {
  constructor(private readonly operatorService: MobileOperatorService) {}

  @Get('hub/profile')
  getHubProfile(@Req() request: Request) {
    return this.operatorService.getHubProfile(getAuthenticatedUser(request));
  }

  @Patch('hub/profile')
  updateHubProfile(
    @Req() request: Request,
    @Body() body: Record<string, unknown>,
  ) {
    return this.operatorService.updateHubProfile(
      getAuthenticatedUser(request),
      body,
    );
  }

  @Post('hub/profile/documents')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'businessDocument', maxCount: 1 },
      { name: 'document', maxCount: 1 },
    ]),
  )
  uploadDocuments(
    @Req() request: Request,
    @UploadedFiles() files: UploadedFileFields | undefined,
  ) {
    return this.operatorService.uploadDocuments(
      getAuthenticatedUser(request),
      files,
    );
  }

  @Get('earnings')
  getEarnings(@Req() request: Request, @Query('period') period?: string) {
    return this.operatorService.getEarnings(
      getAuthenticatedUser(request),
      period,
    );
  }

  @Get('incentives')
  getIncentives(@Req() request: Request) {
    return this.operatorService.getIncentives(getAuthenticatedUser(request));
  }
}
