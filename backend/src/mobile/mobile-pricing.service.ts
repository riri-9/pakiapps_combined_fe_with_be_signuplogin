import { Injectable } from '@nestjs/common';
import {
  getBoolean,
  getNumber,
  getString,
  requireEnum,
} from './mobile.utils.js';

const VEHICLE_TYPES = [
  'motorcycle',
  'sedan',
  'suv',
  'van',
  'truck',
  'puv_relay',
] as const;
const DELIVERY_MODES = ['relay', 'direct', 'dropoff'] as const;
const SERVICE_OPTIONS = ['cheap', 'fast', 'business'] as const;

const VEHICLE_BASE_RATE: Record<(typeof VEHICLE_TYPES)[number], number> = {
  motorcycle: 55,
  sedan: 85,
  suv: 110,
  van: 145,
  truck: 210,
  puv_relay: 45,
};

const SERVICE_MULTIPLIER: Record<(typeof SERVICE_OPTIONS)[number], number> = {
  cheap: 1,
  fast: 1.35,
  business: 1.65,
};

@Injectable()
export class MobilePricingService {
  calculate(body: Record<string, unknown>) {
    const vehicleType = requireEnum(
      getString(body, 'vehicleType'),
      VEHICLE_TYPES,
      'vehicleType',
    );
    const deliveryMode = requireEnum(
      getString(body, 'deliveryMode'),
      DELIVERY_MODES,
      'deliveryMode',
    );
    const serviceOption = requireEnum(
      getString(body, 'serviceOption'),
      SERVICE_OPTIONS,
      'serviceOption',
    );
    const distanceKm = Math.max(0, getNumber(body, 'distanceKm', 'distanceKm'));
    const hops = Math.max(0, Math.floor(getNumber(body, 'hops', 'hops')));
    const isSurgeActive = getBoolean(body, 'isSurgeActive', 'isSurgeActive');
    const applyDiscount = getBoolean(body, 'applyDiscount', 'applyDiscount');

    const baseRate = VEHICLE_BASE_RATE[vehicleType];
    const distanceFee =
      deliveryMode === 'relay'
        ? null
        : Number(
            (distanceKm * 14 * SERVICE_MULTIPLIER[serviceOption]).toFixed(2),
          );
    const hopFee =
      deliveryMode === 'relay' ? Number((hops * 25).toFixed(2)) : null;
    const modeFee = deliveryMode === 'dropoff' ? 20 : 0;
    const subtotal = Number(
      (baseRate + (distanceFee ?? 0) + (hopFee ?? 0) + modeFee).toFixed(2),
    );
    const surgeCharge = isSurgeActive
      ? Number((subtotal * 0.15).toFixed(2))
      : 0;
    const discount = applyDiscount ? Number((subtotal * 0.08).toFixed(2)) : 0;
    const taxable = subtotal + surgeCharge - discount;
    const vat = Number((taxable * 0.12).toFixed(2));
    const finalTotal = Number((taxable + vat).toFixed(2));

    return {
      baseRate,
      distanceFee,
      hopFee,
      subtotal,
      surgeCharge,
      discount,
      vat,
      finalTotal,
    };
  }
}
