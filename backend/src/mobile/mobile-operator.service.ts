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
  getBoolean,
  getNumber,
  getOptionalString,
  getString,
  periodStart,
  sanitizeFileName,
} from './mobile.utils.js';

interface OperatorHubRow {
  id: string;
  operator_user_id: string;
  hub_name: string | null;
  hub_address: string | null;
  lat: number | string | null;
  lng: number | string | null;
  storage_capacity: number | string | null;
  is_active: boolean | null;
  geofence_active: boolean | null;
  profile_picture: string | null;
  business_document_url: string | null;
  documents_status: string | null;
  updated_at: string | null;
}

interface OperatorEarningRow {
  earning_type: string | null;
  amount: number | string | null;
  earned_at: string;
  parcel_tracking_number: string | null;
}

interface OperatorIncentiveRow {
  incentive_type: string;
  title: string;
  amount: number | string | null;
  awarded_at: string;
  notes: string | null;
}

function toNumber(value: number | string | null | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function mapHub(row: OperatorHubRow) {
  return {
    hubId: row.id,
    hubName: row.hub_name,
    hubAddress: row.hub_address,
    lat: toNumber(row.lat),
    lng: toNumber(row.lng),
    storageCapacity: toNumber(row.storage_capacity),
    isActive: Boolean(row.is_active),
    geofenceActive: Boolean(row.geofence_active),
    profilePicture: row.profile_picture,
    businessDocumentUrl: row.business_document_url,
    documentsStatus: row.documents_status ?? 'pending',
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class MobileOperatorService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async getHubProfile(user: AuthenticatedUser) {
    assertRole(user, 'operator');
    const hub = await this.findHub(user.userId);

    if (!hub) {
      throw new NotFoundException('Operator hub profile not found.');
    }

    return { hub: mapHub(hub) };
  }

  async updateHubProfile(
    user: AuthenticatedUser,
    body: Record<string, unknown>,
  ) {
    assertRole(user, 'operator');
    const patch: Record<string, unknown> = {
      operator_user_id: user.userId,
      updated_at: new Date().toISOString(),
    };

    if ('hubName' in body)
      patch.hub_name = getString(body, 'hubName', 'hubName');
    if ('hubAddress' in body) {
      patch.hub_address = getString(body, 'hubAddress', 'hubAddress');
    }
    if ('lat' in body) patch.lat = getNumber(body, 'lat', 'lat');
    if ('lng' in body) patch.lng = getNumber(body, 'lng', 'lng');
    if ('storageCapacity' in body) {
      patch.storage_capacity = getNumber(
        body,
        'storageCapacity',
        'storageCapacity',
      );
    }
    if ('isActive' in body)
      patch.is_active = getBoolean(body, 'isActive', 'isActive');
    if ('profilePicture' in body) {
      patch.profile_picture = getOptionalString(body, 'profilePicture');
    }

    if (Object.keys(patch).length === 2) {
      throw new BadRequestException(
        'At least one hub profile field is required.',
      );
    }

    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('operator_hubs')
      .upsert(patch, { onConflict: 'operator_user_id' })
      .select(
        'id, operator_user_id, hub_name, hub_address, lat, lng, storage_capacity, is_active, geofence_active, profile_picture, business_document_url, documents_status, updated_at',
      )
      .single<OperatorHubRow>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException('Unable to update hub profile.');
    }

    return {
      hub: mapHub(result.data),
      message: 'Operator hub profile updated.',
    };
  }

  async uploadDocuments(
    user: AuthenticatedUser,
    files: UploadedFileFields | undefined,
  ) {
    assertRole(user, 'operator');
    const businessDocument =
      files?.businessDocument?.[0] ?? files?.document?.[0];
    if (!businessDocument) {
      throw new BadRequestException('businessDocument file is required.');
    }

    const documentUrl = await this.uploadFile(
      user.userId,
      'operator/business-document',
      businessDocument,
    );
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('operator_hubs')
      .upsert(
        {
          operator_user_id: user.userId,
          business_document_url: documentUrl,
          documents_status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'operator_user_id' },
      )
      .select(
        'id, operator_user_id, hub_name, hub_address, lat, lng, storage_capacity, is_active, geofence_active, profile_picture, business_document_url, documents_status, updated_at',
      )
      .single<OperatorHubRow>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException(
        'Unable to save operator document.',
      );
    }

    return {
      hub: mapHub(result.data),
      message: 'Operator document uploaded for review.',
    };
  }

  async getEarnings(user: AuthenticatedUser, period: string | undefined) {
    assertRole(user, 'operator');
    const start = periodStart(period).toISOString();
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('operator_earnings')
      .select('earning_type, amount, earned_at, parcel_tracking_number')
      .eq('operator_user_id', user.userId)
      .gte('earned_at', start)
      .order('earned_at', { ascending: false })
      .returns<OperatorEarningRow[]>();

    if (result.error) {
      throw new InternalServerErrorException(
        'Unable to load operator earnings.',
      );
    }

    const breakdown = (result.data ?? []).map((row) => ({
      earningType: row.earning_type,
      amount: toNumber(row.amount),
      earnedAt: row.earned_at,
      parcelTrackingNumber: row.parcel_tracking_number,
    }));

    return {
      totalAmount: breakdown.reduce((sum, row) => sum + row.amount, 0),
      parcelsProcessed: breakdown.length,
      breakdown,
    };
  }

  async getIncentives(user: AuthenticatedUser) {
    assertRole(user, 'operator');
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('operator_incentives')
      .select('incentive_type, title, amount, awarded_at, notes')
      .eq('operator_user_id', user.userId)
      .order('awarded_at', { ascending: false })
      .returns<OperatorIncentiveRow[]>();

    if (result.error) {
      throw new InternalServerErrorException(
        'Unable to load operator incentives.',
      );
    }

    return {
      incentives: (result.data ?? []).map((row) => ({
        incentiveType: row.incentive_type,
        title: row.title,
        amount: toNumber(row.amount),
        awardedAt: row.awarded_at,
        notes: row.notes,
      })),
    };
  }

  private async findHub(
    operatorUserId: string,
  ): Promise<OperatorHubRow | null> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('operator_hubs')
      .select(
        'id, operator_user_id, hub_name, hub_address, lat, lng, storage_capacity, is_active, geofence_active, profile_picture, business_document_url, documents_status, updated_at',
      )
      .eq('operator_user_id', operatorUserId)
      .maybeSingle<OperatorHubRow>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load operator hub.');
    }

    return result.data ?? null;
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
