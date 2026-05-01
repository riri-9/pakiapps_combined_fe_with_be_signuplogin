import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import type {
  UploadedFile,
  UploadedFileFields,
} from './mobile-upload.types.js';
import {
  UPLOAD_BUCKET_ENV,
  assertJpegOrPng,
  assertRole,
  formatCurrency,
  getBoolean,
  getOptionalString,
  getString,
  periodStart,
  requireEnum,
  sanitizeFileName,
} from './mobile.utils.js';

const DELIVERY_MODES = ['relay', 'direct'] as const;
const JOB_STATUSES = ['available', 'in-progress', 'completed'] as const;
const PARCEL_STATUSES = ['picked-up', 'out-for-delivery', 'delivered'] as const;

interface DriverProfileRow {
  driver_user_id: string;
  vehicle_type: string | null;
  license_number: string | null;
  delivery_mode: string | null;
  is_online: boolean | null;
  acceptance_rate: number | string | null;
  documents_status: string | null;
  profile_picture: string | null;
  license_document_url: string | null;
  registration_document_url: string | null;
  updated_at: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface DriverJobRow {
  id: string;
  job_number: string;
  parcel_draft_id: string | null;
  customer_user_id: string | null;
  driver_user_id: string | null;
  pickup_address: string;
  dropoff_address: string;
  distance_text: string | null;
  earnings_amount: number | string | null;
  status: string;
  parcel_status: string | null;
  customer_name: string;
  customer_phone: string | null;
  package_description: string | null;
  special_instructions: string | null;
  time_limit_text: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
}

interface DriverEarningRow {
  job_id: string;
  job_number: string | null;
  amount: number | string | null;
  earned_at: string;
}

export interface DriverSummary {
  name: string;
  phone: string | null;
  vehicleType: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function mapDriverProfile(row: DriverProfileRow | null) {
  return {
    vehicleType: row?.vehicle_type ?? null,
    licenseNumber: row?.license_number ?? null,
    deliveryMode: row?.delivery_mode ?? 'direct',
    isOnline: Boolean(row?.is_online),
    acceptanceRate: toNumber(row?.acceptance_rate ?? 1),
    documentsStatus: row?.documents_status ?? 'pending',
    profilePicture: row?.profile_picture ?? null,
    documents: {
      license: row?.license_document_url ?? null,
      registration: row?.registration_document_url ?? null,
    },
    updatedAt: row?.updated_at ?? null,
  };
}

function mapJob(row: DriverJobRow) {
  const earningsAmount = toNumber(row.earnings_amount);
  return {
    id: row.id,
    jobNumber: row.job_number,
    pickup: row.pickup_address,
    dropoff: row.dropoff_address,
    distance: row.distance_text ?? 'TBD',
    earnings: earningsAmount,
    earningsLabel: formatCurrency(earningsAmount),
    timeLimit: row.time_limit_text,
    packageDescription: row.package_description,
    specialInstructions: row.special_instructions,
    currentParcelStatus: row.parcel_status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status,
    parcelDraftId: row.parcel_draft_id,
    acceptedAt: row.accepted_at,
    deliveredAt: row.delivered_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class MobileDriverService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(user: AuthenticatedUser) {
    assertRole(user, 'driver');
    const row = await this.findDriverProfile(user.userId);
    return { profile: mapDriverProfile(row) };
  }

  async updateProfile(user: AuthenticatedUser, body: Record<string, unknown>) {
    assertRole(user, 'driver');
    const patch: Record<string, unknown> = {
      driver_user_id: user.userId,
      updated_at: new Date().toISOString(),
    };

    if ('vehicleType' in body) {
      patch.vehicle_type = getString(body, 'vehicleType', 'vehicleType');
    }
    if ('licenseNumber' in body) {
      patch.license_number = getString(body, 'licenseNumber', 'licenseNumber');
    }
    if ('deliveryMode' in body) {
      patch.delivery_mode = requireEnum(
        getString(body, 'deliveryMode', 'deliveryMode'),
        DELIVERY_MODES,
        'deliveryMode',
      );
    }
    if ('profilePicture' in body) {
      patch.profile_picture = getOptionalString(body, 'profilePicture');
    }

    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_profiles')
      .upsert(patch, { onConflict: 'driver_user_id' })
      .select(
        'driver_user_id, vehicle_type, license_number, delivery_mode, is_online, acceptance_rate, documents_status, profile_picture, license_document_url, registration_document_url, updated_at',
      )
      .single<DriverProfileRow>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException(
        'Unable to update driver profile.',
      );
    }

    return {
      profile: mapDriverProfile(result.data),
      message: 'Driver profile updated.',
    };
  }

  async updateOnlineStatus(
    user: AuthenticatedUser,
    body: Record<string, unknown>,
  ) {
    assertRole(user, 'driver');
    const isOnline = getBoolean(body, 'isOnline', 'isOnline');
    const activeJob = await this.findActiveJob(user.userId);

    if (!isOnline && activeJob) {
      throw new BadRequestException(
        'Complete your active job before going offline.',
      );
    }

    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_profiles')
      .upsert(
        {
          driver_user_id: user.userId,
          is_online: isOnline,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'driver_user_id' },
      )
      .select(
        'driver_user_id, vehicle_type, license_number, delivery_mode, is_online, acceptance_rate, documents_status, profile_picture, license_document_url, registration_document_url, updated_at',
      )
      .single<DriverProfileRow>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException('Unable to update online status.');
    }

    return {
      profile: mapDriverProfile(result.data),
      isOnline,
    };
  }

  async uploadDocuments(
    user: AuthenticatedUser,
    files: UploadedFileFields | undefined,
  ) {
    assertRole(user, 'driver');
    const license = files?.license?.[0];
    const registration = files?.registration?.[0];

    if (!license || !registration) {
      throw new BadRequestException(
        'license and registration files are required.',
      );
    }

    const [licenseUrl, registrationUrl] = await Promise.all([
      this.uploadFile(user.userId, 'driver/license', license),
      this.uploadFile(user.userId, 'driver/registration', registration),
    ]);

    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_profiles')
      .upsert(
        {
          driver_user_id: user.userId,
          license_document_url: licenseUrl,
          registration_document_url: registrationUrl,
          documents_status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'driver_user_id' },
      )
      .select(
        'driver_user_id, vehicle_type, license_number, delivery_mode, is_online, acceptance_rate, documents_status, profile_picture, license_document_url, registration_document_url, updated_at',
      )
      .single<DriverProfileRow>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException(
        'Unable to save driver documents.',
      );
    }

    return {
      profile: mapDriverProfile(result.data),
      message: 'Driver documents uploaded for review.',
    };
  }

  async listJobs(user: AuthenticatedUser, statusValue: string | undefined) {
    assertRole(user, 'driver');
    const status = requireEnum(
      statusValue ?? 'available',
      JOB_STATUSES,
      'status',
    );
    const supabase = this.supabaseService.requireClient();
    const query = supabase
      .from('driver_jobs')
      .select(
        'id, job_number, parcel_draft_id, customer_user_id, driver_user_id, pickup_address, dropoff_address, distance_text, earnings_amount, status, parcel_status, customer_name, customer_phone, package_description, special_instructions, time_limit_text, created_at, updated_at, accepted_at, delivered_at, completed_at',
      )
      .eq('status', status)
      .order('updated_at', { ascending: false });

    const result =
      status === 'available'
        ? await query.is('driver_user_id', null).returns<DriverJobRow[]>()
        : await query
            .eq('driver_user_id', user.userId)
            .returns<DriverJobRow[]>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load driver jobs.');
    }

    return {
      jobs: (result.data ?? []).map(mapJob),
    };
  }

  async getJob(user: AuthenticatedUser, jobId: string) {
    assertRole(user, 'driver');
    const job = await this.findVisibleJob(user.userId, jobId);
    return { job: mapJob(job) };
  }

  async acceptJob(user: AuthenticatedUser, jobId: string) {
    assertRole(user, 'driver');
    const activeJob = await this.findActiveJob(user.userId);
    if (activeJob) {
      throw new BadRequestException(
        'Complete your active job before accepting another one.',
      );
    }

    const job = await this.findVisibleJob(user.userId, jobId);
    if (job.status !== 'available' || job.driver_user_id) {
      throw new BadRequestException('This job is no longer available.');
    }

    const now = new Date().toISOString();
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_jobs')
      .update({
        driver_user_id: user.userId,
        status: 'in-progress',
        accepted_at: now,
        updated_at: now,
      })
      .eq('id', jobId)
      .eq('status', 'available')
      .is('driver_user_id', null)
      .select(
        'id, job_number, parcel_draft_id, customer_user_id, driver_user_id, pickup_address, dropoff_address, distance_text, earnings_amount, status, parcel_status, customer_name, customer_phone, package_description, special_instructions, time_limit_text, created_at, updated_at, accepted_at, delivered_at, completed_at',
      )
      .single<DriverJobRow>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException('Unable to accept job.');
    }

    if (result.data.parcel_draft_id) {
      await supabase
        .from('parcel_drafts')
        .update({
          assigned_driver_id: user.userId,
          tracking_progress_label: 'Driver accepted the parcel',
          tracking_progress_percentage: 35,
          updated_at: now,
        })
        .eq('id', result.data.parcel_draft_id);
    }

    return {
      status: result.data.status,
      job: mapJob(result.data),
    };
  }

  async rejectJob(
    user: AuthenticatedUser,
    jobId: string,
    body: Record<string, unknown>,
  ) {
    assertRole(user, 'driver');
    await this.findVisibleJob(user.userId, jobId);
    const supabase = this.supabaseService.requireClient();
    const now = new Date().toISOString();

    const eventResult = await supabase.from('driver_job_events').insert({
      job_id: jobId,
      driver_user_id: user.userId,
      event_type: 'job_rejected',
      payload: { reason: getOptionalString(body, 'reason') },
      created_at: now,
    });

    if (eventResult.error) {
      throw new InternalServerErrorException('Unable to reject job.');
    }

    const profile = await this.findDriverProfile(user.userId);
    const nextAcceptanceRate = Math.max(
      0,
      Number((toNumber(profile?.acceptance_rate ?? 1) - 0.05).toFixed(2)),
    );

    await supabase.from('driver_profiles').upsert(
      {
        driver_user_id: user.userId,
        acceptance_rate: nextAcceptanceRate,
        updated_at: now,
      },
      { onConflict: 'driver_user_id' },
    );

    return {
      rejected: true,
      jobId,
      acceptanceRate: nextAcceptanceRate,
    };
  }

  async updateParcelStatus(
    user: AuthenticatedUser,
    jobId: string,
    body: Record<string, unknown>,
  ) {
    assertRole(user, 'driver');
    const parcelStatus = requireEnum(
      getString(body, 'parcelStatus', 'parcelStatus'),
      PARCEL_STATUSES,
      'parcelStatus',
    );
    const job = await this.findVisibleJob(user.userId, jobId);
    if (job.driver_user_id !== user.userId || job.status !== 'in-progress') {
      throw new BadRequestException(
        'Only your in-progress job can be updated.',
      );
    }

    const now = new Date().toISOString();
    const nextJobStatus =
      parcelStatus === 'delivered' ? 'completed' : 'in-progress';
    const supabase = this.supabaseService.requireClient();
    const updateResult = await supabase
      .from('driver_jobs')
      .update({
        parcel_status: parcelStatus,
        status: nextJobStatus,
        ...(parcelStatus === 'delivered'
          ? { delivered_at: now, completed_at: now }
          : {}),
        updated_at: now,
      })
      .eq('id', jobId)
      .eq('driver_user_id', user.userId)
      .select(
        'id, job_number, parcel_draft_id, customer_user_id, driver_user_id, pickup_address, dropoff_address, distance_text, earnings_amount, status, parcel_status, customer_name, customer_phone, package_description, special_instructions, time_limit_text, created_at, updated_at, accepted_at, delivered_at, completed_at',
      )
      .single<DriverJobRow>();

    if (updateResult.error || !updateResult.data) {
      throw new InternalServerErrorException('Unable to update parcel status.');
    }

    if (job.parcel_draft_id) {
      await this.updateParcelDraftFromJob(
        job.parcel_draft_id,
        parcelStatus,
        now,
      );
    }

    if (parcelStatus === 'delivered') {
      await supabase.from('driver_earnings').upsert(
        {
          job_id: job.id,
          driver_user_id: user.userId,
          job_number: job.job_number,
          amount: toNumber(job.earnings_amount),
          earned_at: now,
        },
        { onConflict: 'job_id' },
      );
    }

    return {
      parcelStatus,
      jobStatus: nextJobStatus,
      job: mapJob(updateResult.data),
    };
  }

  async getEarnings(user: AuthenticatedUser, period: string | undefined) {
    assertRole(user, 'driver');
    const start = periodStart(period).toISOString();
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_earnings')
      .select('job_id, job_number, amount, earned_at')
      .eq('driver_user_id', user.userId)
      .gte('earned_at', start)
      .order('earned_at', { ascending: false })
      .returns<DriverEarningRow[]>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load driver earnings.');
    }

    const breakdown = (result.data ?? []).map((row) => ({
      jobId: row.job_id,
      jobNumber: row.job_number,
      amount: toNumber(row.amount),
      earnedAt: row.earned_at,
    }));

    return {
      totalAmount: breakdown.reduce((sum, row) => sum + row.amount, 0),
      completedJobs: breakdown.length,
      breakdown,
    };
  }

  async getDriverSummary(driverId: string): Promise<DriverSummary | null> {
    const supabase = this.supabaseService.requireClient();
    const [profileResult, driverResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', driverId)
        .maybeSingle<ProfileRow>(),
      supabase
        .from('driver_profiles')
        .select(
          'driver_user_id, vehicle_type, license_number, delivery_mode, is_online, acceptance_rate, documents_status, profile_picture, license_document_url, registration_document_url, updated_at',
        )
        .eq('driver_user_id', driverId)
        .maybeSingle<DriverProfileRow>(),
    ]);

    if (profileResult.error || !profileResult.data) {
      return null;
    }

    return {
      name: profileResult.data.full_name ?? 'Driver',
      phone: profileResult.data.phone,
      vehicleType: driverResult.data?.vehicle_type ?? null,
    };
  }

  private async findDriverProfile(
    driverUserId: string,
  ): Promise<DriverProfileRow | null> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_profiles')
      .select(
        'driver_user_id, vehicle_type, license_number, delivery_mode, is_online, acceptance_rate, documents_status, profile_picture, license_document_url, registration_document_url, updated_at',
      )
      .eq('driver_user_id', driverUserId)
      .maybeSingle<DriverProfileRow>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load driver profile.');
    }

    return result.data ?? null;
  }

  private async findActiveJob(
    driverUserId: string,
  ): Promise<DriverJobRow | null> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_jobs')
      .select(
        'id, job_number, parcel_draft_id, customer_user_id, driver_user_id, pickup_address, dropoff_address, distance_text, earnings_amount, status, parcel_status, customer_name, customer_phone, package_description, special_instructions, time_limit_text, created_at, updated_at, accepted_at, delivered_at, completed_at',
      )
      .eq('driver_user_id', driverUserId)
      .eq('status', 'in-progress')
      .limit(1)
      .maybeSingle<DriverJobRow>();

    if (result.error) {
      throw new InternalServerErrorException(
        'Unable to load active driver job.',
      );
    }

    return result.data ?? null;
  }

  private async findVisibleJob(
    driverUserId: string,
    jobId: string,
  ): Promise<DriverJobRow> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('driver_jobs')
      .select(
        'id, job_number, parcel_draft_id, customer_user_id, driver_user_id, pickup_address, dropoff_address, distance_text, earnings_amount, status, parcel_status, customer_name, customer_phone, package_description, special_instructions, time_limit_text, created_at, updated_at, accepted_at, delivered_at, completed_at',
      )
      .eq('id', jobId)
      .maybeSingle<DriverJobRow>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load driver job.');
    }

    if (!result.data) {
      throw new NotFoundException('Driver job not found.');
    }

    if (
      result.data.driver_user_id &&
      result.data.driver_user_id !== driverUserId
    ) {
      throw new NotFoundException('Driver job not found.');
    }

    return result.data;
  }

  private async updateParcelDraftFromJob(
    parcelDraftId: string,
    parcelStatus: (typeof PARCEL_STATUSES)[number],
    timestamp: string,
  ): Promise<void> {
    const statusPatch =
      parcelStatus === 'picked-up'
        ? {
            status: 'picked_up',
            tracking_progress_label: 'Parcel picked up',
            tracking_progress_percentage: 50,
          }
        : parcelStatus === 'out-for-delivery'
          ? {
              status: 'out_for_delivery',
              tracking_progress_label: 'Out for delivery',
              tracking_progress_percentage: 75,
            }
          : {
              status: 'delivered',
              tracking_progress_label: 'Delivered',
              tracking_progress_percentage: 100,
            };

    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('parcel_drafts')
      .update({
        ...statusPatch,
        updated_at: timestamp,
      })
      .eq('id', parcelDraftId);

    if (result.error) {
      throw new InternalServerErrorException(
        'Unable to sync parcel tracking status.',
      );
    }
  }

  private async uploadFile(
    userId: string,
    folder: string,
    file: UploadedFile,
  ): Promise<string> {
    assertJpegOrPng(file.mimetype);
    const bucket =
      this.configService.get<string>(UPLOAD_BUCKET_ENV) ?? 'mobile-uploads';
    const supabase = this.supabaseService.requireClient();
    const safeName = sanitizeFileName(file.originalname) || `${Date.now()}.jpg`;
    const path = `${folder}/${userId}/${Date.now()}-${safeName}`;

    const result = await supabase.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (result.error) {
      throw new InternalServerErrorException('Unable to upload document.');
    }

    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}
