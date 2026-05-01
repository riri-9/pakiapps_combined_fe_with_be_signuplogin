import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../common/auth/authenticated-user.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { MobileDriverService } from './mobile-driver.service.js';
import { MobileNotificationsService } from './mobile-notifications.service.js';
import {
  assertRole,
  createQrCodeUri,
  createTrackingNumber,
  getNumber,
  getOptionalString,
  getRecord,
  getString,
  getStringArray,
  optionalUuid,
  requireEnum,
} from './mobile.utils.js';

const SERVICE_IDS = ['pakishare', 'pakiexpress', 'pakibusiness'] as const;
const DELIVERY_MODES = ['relay', 'direct', 'dropoff'] as const;
const ITEM_SIZES = ['S', 'M', 'L', 'XL'] as const;
const DELIVERY_GUARANTEES = ['basic', 'standard', 'premium'] as const;
const ACTIVE_STATUSES = [
  'submitted',
  'assigned',
  'picked_up',
  'picked-up',
  'out_for_delivery',
  'out-for-delivery',
  'in_transit',
  'in-transit',
];
const COMPLETED_STATUSES = ['delivered', 'cancelled', 'lost'];

interface ParcelDraftRow {
  id: string;
  user_id: string;
  tracking_number: string | null;
  status: string;
  pickup_address: string | null;
  pickup_lat: number | string | null;
  pickup_lng: number | string | null;
  delivery_address: string | null;
  delivery_lat: number | string | null;
  delivery_lng: number | string | null;
  distance_text: string | null;
  duration_text: string | null;
  sender_name: string | null;
  sender_phone: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  service_id: string | null;
  service_price: number | string | null;
  delivery_mode: string | null;
  drop_off_point_id: string | null;
  payment_method: string | null;
  assigned_driver_id: string | null;
  qr_code_url: string | null;
  tracking_current_location: string | null;
  tracking_progress_label: string | null;
  tracking_progress_percentage: number | string | null;
  created_at: string;
  updated_at: string;
}

interface ParcelItemRow {
  id: string;
  size: string | null;
  weight_text: string | null;
  item_type: string | null;
  delivery_guarantee: string | null;
  quantity: number | string | null;
  photo_url: string | null;
}

interface ParcelItemInput {
  size: string;
  weightText: string;
  itemType: string;
  deliveryGuarantee: string;
  quantity: number;
  photoUrl: string | null;
}

function toNumber(value: number | string | null | undefined): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Each parcel item must be an object.');
  }

  return value as Record<string, unknown>;
}

function normalizeItem(raw: unknown): ParcelItemInput {
  const item = asRecord(raw);
  const size = requireEnum(getString(item, 'size'), ITEM_SIZES, 'size');
  const deliveryGuarantee = requireEnum(
    getString(item, 'deliveryGuarantee'),
    DELIVERY_GUARANTEES,
    'deliveryGuarantee',
  );
  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new BadRequestException('quantity must be a positive integer.');
  }

  return {
    size,
    weightText: getString(item, 'weightText'),
    itemType: getString(item, 'itemType'),
    deliveryGuarantee,
    quantity,
    photoUrl: getOptionalString(item, 'photoUrl'),
  };
}

function mapItem(row: ParcelItemRow) {
  return {
    id: row.id,
    size: row.size,
    weightText: row.weight_text,
    itemType: row.item_type,
    deliveryGuarantee: row.delivery_guarantee,
    quantity: toNumber(row.quantity) ?? 0,
    photoUrl: row.photo_url,
  };
}

function normalizeStatusForTracking(status: string): string {
  if (status === 'picked_up') return 'picked-up';
  if (status === 'out_for_delivery') return 'out-for-delivery';
  if (status === 'in_transit') return 'in-transit';
  return status;
}

function createTrackingSnapshot(row: ParcelDraftRow) {
  const status = normalizeStatusForTracking(row.status);
  const progress =
    toNumber(row.tracking_progress_percentage) ??
    (status === 'delivered' ? 100 : status === 'cancelled' ? 0 : 20);

  return {
    status,
    currentLocation:
      row.tracking_current_location ?? row.pickup_address ?? 'Preparing parcel',
    progressLabel:
      row.tracking_progress_label ??
      (status === 'submitted' ? 'Booking Confirmed' : status),
    progressPercentage: progress,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class MobileParcelsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly driverService: MobileDriverService,
    private readonly notificationsService: MobileNotificationsService,
  ) {}

  async createParcel(user: AuthenticatedUser, body: Record<string, unknown>) {
    assertRole(user, 'customer');

    const serviceId = requireEnum(
      getString(body, 'serviceId'),
      SERVICE_IDS,
      'serviceId',
    );
    const deliveryMode = requireEnum(
      getString(body, 'deliveryMode'),
      DELIVERY_MODES,
      'deliveryMode',
    );
    const dropOffPointId = getOptionalString(body, 'dropOffPointId');
    if (deliveryMode === 'dropoff' && !dropOffPointId) {
      throw new BadRequestException('dropOffPointId is required for dropoff.');
    }

    const deviceLocation = getRecord(body, 'deviceLocation');
    if (!deviceLocation) {
      throw new BadRequestException(
        'deviceLocation is required for mobile parcel creation.',
      );
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length < 1) {
      throw new BadRequestException('At least one parcel item is required.');
    }

    const items = rawItems.map(normalizeItem);
    const trackingNumber = createTrackingNumber();
    const qrCodeUrl = createQrCodeUri(trackingNumber);
    const now = new Date().toISOString();
    const pickupAddress = getString(body, 'pickupAddress', 'pickupAddress');
    const deliveryAddress = getString(
      body,
      'deliveryAddress',
      'deliveryAddress',
    );
    const supabase = this.supabaseService.requireClient();

    const parcelResult = await supabase
      .from('parcel_drafts')
      .insert({
        user_id: user.userId,
        pickup_address: pickupAddress,
        pickup_lat: getNumber(body, 'pickupLat', 'pickupLat'),
        pickup_lng: getNumber(body, 'pickupLng', 'pickupLng'),
        delivery_address: deliveryAddress,
        delivery_lat: getNumber(body, 'deliveryLat', 'deliveryLat'),
        delivery_lng: getNumber(body, 'deliveryLng', 'deliveryLng'),
        distance_text: getString(body, 'distanceText', 'distanceText'),
        duration_text: getString(body, 'durationText', 'durationText'),
        sender_name: getString(body, 'senderName', 'senderName'),
        sender_phone: getString(body, 'senderPhone', 'senderPhone'),
        receiver_name: getString(body, 'receiverName', 'receiverName'),
        receiver_phone: getString(body, 'receiverPhone', 'receiverPhone'),
        service_id: serviceId,
        service_price: getNumber(body, 'servicePrice', 'servicePrice'),
        delivery_mode: deliveryMode,
        drop_off_point_id: dropOffPointId,
        payment_method: getString(body, 'paymentMethod', 'paymentMethod'),
        device_lat: getNumber(deviceLocation, 'lat', 'deviceLocation.lat'),
        device_lng: getNumber(deviceLocation, 'lng', 'deviceLocation.lng'),
        status: 'submitted',
        step_completed: 5,
        tracking_number: trackingNumber,
        qr_code_url: qrCodeUrl,
        tracking_current_location: pickupAddress,
        tracking_progress_label: 'Booking Confirmed',
        tracking_progress_percentage: 20,
        created_at: now,
        updated_at: now,
      })
      .select('id, tracking_number, status, qr_code_url')
      .single<{
        id: string;
        tracking_number: string | null;
        status: string;
        qr_code_url: string | null;
      }>();

    if (parcelResult.error || !parcelResult.data) {
      throw new InternalServerErrorException('Unable to create parcel.');
    }

    const itemRows = items.map((item) => ({
      parcel_draft_id: parcelResult.data.id,
      size: item.size,
      weight_text: item.weightText,
      item_type: item.itemType,
      delivery_guarantee: item.deliveryGuarantee,
      quantity: item.quantity,
      photo_url: item.photoUrl,
    }));

    const itemResult = await supabase
      .from('parcel_draft_items')
      .insert(itemRows);
    if (itemResult.error) {
      throw new InternalServerErrorException(
        'Parcel was created but items could not be saved.',
      );
    }

    await this.createAvailableDriverJob(parcelResult.data.id, body, user);
    await this.notificationsService.create(
      user.userId,
      'delivery',
      'Parcel booking confirmed',
      `Your parcel is booked. Tracking No. ${trackingNumber}.`,
    );

    return {
      trackingNumber,
      parcelDraftId: parcelResult.data.id,
      status: parcelResult.data.status,
      qrCodeUrl: parcelResult.data.qr_code_url ?? qrCodeUrl,
    };
  }

  async listParcels(
    user: AuthenticatedUser,
    status: string | undefined,
    pageValue: string | undefined,
    limitValue: string | undefined,
  ) {
    assertRole(user, 'customer');
    const bucket = status ?? 'active';
    if (!['active', 'completed'].includes(bucket)) {
      throw new BadRequestException('status must be active or completed.');
    }

    const page = Math.max(1, Number(pageValue ?? 1));
    const limit = Math.min(Math.max(1, Number(limitValue ?? 10)), 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('parcel_drafts')
      .select(
        'id, tracking_number, status, pickup_address, delivery_address, receiver_name, service_id, service_price, delivery_mode, created_at, updated_at',
        { count: 'exact' },
      )
      .eq('user_id', user.userId)
      .in('status', bucket === 'active' ? ACTIVE_STATUSES : COMPLETED_STATUSES)
      .order('created_at', { ascending: false })
      .range(from, to)
      .returns<
        Array<
          Pick<
            ParcelDraftRow,
            | 'id'
            | 'tracking_number'
            | 'status'
            | 'pickup_address'
            | 'delivery_address'
            | 'receiver_name'
            | 'service_id'
            | 'service_price'
            | 'delivery_mode'
            | 'created_at'
            | 'updated_at'
          >
        >
      >();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load parcels.');
    }

    return {
      parcels: (result.data ?? []).map((row) => ({
        id: row.id,
        trackingNumber: row.tracking_number,
        status: normalizeStatusForTracking(row.status),
        pickupAddress: row.pickup_address,
        deliveryAddress: row.delivery_address,
        receiverName: row.receiver_name,
        serviceId: row.service_id,
        servicePrice: toNumber(row.service_price),
        deliveryMode: row.delivery_mode,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      pagination: {
        page,
        limit,
        total: result.count ?? 0,
        hasMore: from + (result.data?.length ?? 0) < (result.count ?? 0),
      },
    };
  }

  async getParcel(user: AuthenticatedUser, parcelId: string) {
    assertRole(user, 'customer');
    const draft = await this.findOwnedParcel(user.userId, parcelId);
    const items = await this.listParcelItems(parcelId);
    const assignedDriver = draft.assigned_driver_id
      ? await this.driverService.getDriverSummary(draft.assigned_driver_id)
      : null;

    return {
      id: draft.id,
      trackingNumber: draft.tracking_number,
      status: normalizeStatusForTracking(draft.status),
      pickupAddress: draft.pickup_address,
      pickupLat: toNumber(draft.pickup_lat),
      pickupLng: toNumber(draft.pickup_lng),
      deliveryAddress: draft.delivery_address,
      deliveryLat: toNumber(draft.delivery_lat),
      deliveryLng: toNumber(draft.delivery_lng),
      senderName: draft.sender_name,
      senderPhone: draft.sender_phone,
      receiverName: draft.receiver_name,
      receiverPhone: draft.receiver_phone,
      serviceId: draft.service_id,
      servicePrice: toNumber(draft.service_price),
      deliveryMode: draft.delivery_mode,
      dropOffPointId: draft.drop_off_point_id,
      paymentMethod: draft.payment_method,
      assignedDriverId: draft.assigned_driver_id,
      assignedDriver,
      items,
      tracking: createTrackingSnapshot(draft),
      qrCodeUrl: draft.qr_code_url,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
    };
  }

  async cancelParcel(
    user: AuthenticatedUser,
    parcelId: string,
    body: Record<string, unknown>,
  ) {
    assertRole(user, 'customer');
    const reason = getString(body, 'reason', 'reason');
    await this.findOwnedParcel(user.userId, parcelId);
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('parcel_drafts')
      .update({
        status: 'cancelled',
        cancel_reason: reason,
        tracking_progress_label: 'Parcel cancelled',
        tracking_progress_percentage: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parcelId)
      .eq('user_id', user.userId)
      .select('id, status')
      .single<{ id: string; status: string }>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException('Unable to cancel parcel.');
    }

    return {
      parcelDraftId: result.data.id,
      status: result.data.status,
    };
  }

  async reviewParcel(
    user: AuthenticatedUser,
    parcelId: string,
    body: Record<string, unknown>,
  ) {
    assertRole(user, 'customer');
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException(
        'rating must be a whole number from 1 to 5.',
      );
    }

    const reviewText = getOptionalString(body, 'reviewText');
    if (reviewText && reviewText.length > 500) {
      throw new BadRequestException(
        'reviewText must be 500 characters or fewer.',
      );
    }

    const parcel = await this.findOwnedParcel(user.userId, parcelId);
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('parcel_reviews')
      .upsert(
        {
          parcel_draft_id: parcel.id,
          customer_user_id: user.userId,
          ...(optionalUuid(parcel.drop_off_point_id)
            ? { hub_id: optionalUuid(parcel.drop_off_point_id) }
            : {}),
          tracking_number: parcel.tracking_number,
          rating,
          review_text: reviewText,
          tags: getStringArray(body.tags),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'parcel_draft_id,customer_user_id' },
      )
      .select('id')
      .single<{ id: string }>();

    if (result.error || !result.data) {
      throw new InternalServerErrorException('Unable to submit parcel review.');
    }

    return {
      reviewId: result.data.id,
      parcelDraftId: parcel.id,
      rating,
      reviewText,
      tags: getStringArray(body.tags),
    };
  }

  private async findOwnedParcel(
    userId: string,
    parcelId: string,
  ): Promise<ParcelDraftRow> {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('parcel_drafts')
      .select(
        `
          id,
          user_id,
          tracking_number,
          status,
          pickup_address,
          pickup_lat,
          pickup_lng,
          delivery_address,
          delivery_lat,
          delivery_lng,
          distance_text,
          duration_text,
          sender_name,
          sender_phone,
          receiver_name,
          receiver_phone,
          service_id,
          service_price,
          delivery_mode,
          drop_off_point_id,
          payment_method,
          assigned_driver_id,
          qr_code_url,
          tracking_current_location,
          tracking_progress_label,
          tracking_progress_percentage,
          created_at,
          updated_at
        `,
      )
      .eq('id', parcelId)
      .eq('user_id', userId)
      .maybeSingle<ParcelDraftRow>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load parcel.');
    }

    if (!result.data) {
      throw new NotFoundException('Parcel not found.');
    }

    return result.data;
  }

  private async listParcelItems(parcelId: string) {
    const supabase = this.supabaseService.requireClient();
    const result = await supabase
      .from('parcel_draft_items')
      .select(
        'id, size, weight_text, item_type, delivery_guarantee, quantity, photo_url',
      )
      .eq('parcel_draft_id', parcelId)
      .order('id', { ascending: true })
      .returns<ParcelItemRow[]>();

    if (result.error) {
      throw new InternalServerErrorException('Unable to load parcel items.');
    }

    return (result.data ?? []).map(mapItem);
  }

  private async createAvailableDriverJob(
    parcelDraftId: string,
    body: Record<string, unknown>,
    user: AuthenticatedUser,
  ): Promise<void> {
    const supabase = this.supabaseService.requireClient();
    const receiverName = getString(body, 'receiverName', 'receiverName');
    const bodyItems: unknown = body.items;
    const firstItem: unknown = Array.isArray(bodyItems) ? bodyItems[0] : null;
    const itemType =
      firstItem && typeof firstItem === 'object' && !Array.isArray(firstItem)
        ? getOptionalString(firstItem as Record<string, unknown>, 'itemType')
        : null;

    const result = await supabase.from('driver_jobs').insert({
      job_number: createTrackingNumber('JOB'),
      parcel_draft_id: parcelDraftId,
      customer_user_id: user.userId,
      pickup_address: getString(body, 'pickupAddress', 'pickupAddress'),
      dropoff_address: getString(body, 'deliveryAddress', 'deliveryAddress'),
      distance_text: getString(body, 'distanceText', 'distanceText'),
      earnings_amount: getNumber(body, 'servicePrice', 'servicePrice'),
      status: 'available',
      customer_name:
        user.fullName ?? getString(body, 'senderName', 'senderName'),
      customer_phone: getString(body, 'senderPhone', 'senderPhone'),
      package_size: 'Small',
      time_limit_text: getString(body, 'durationText', 'durationText'),
      package_description: itemType ?? `Parcel for ${receiverName}`,
      special_instructions: null,
    });

    if (result.error) {
      throw new InternalServerErrorException(
        'Unable to create driver job queue entry.',
      );
    }
  }
}
