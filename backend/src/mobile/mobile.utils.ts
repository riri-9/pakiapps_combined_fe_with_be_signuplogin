import {
  BadRequestException,
  ForbiddenException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type {
  AuthenticatedUser,
  UserRole,
} from '../common/auth/authenticated-user.js';

export const MOBILE_PREFIX = 'pakiship/mobile';
export const UPLOAD_BUCKET_ENV = 'SUPABASE_MOBILE_UPLOAD_BUCKET';

const PH_TIMEZONE_OFFSET_HOURS = 8;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertRole(
  user: AuthenticatedUser,
  ...allowedRoles: UserRole[]
): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenException(
      'This endpoint is not available for your role.',
    );
  }
}

export function getString(
  body: Record<string, unknown>,
  key: string,
  label = key,
): string {
  const value = body[key];
  const text = typeof value === 'string' ? value.trim() : '';

  if (!text) {
    throw new BadRequestException(`${label} is required.`);
  }

  return text;
}

export function getOptionalString(
  body: Record<string, unknown>,
  key: string,
): string | null {
  const value = body[key];
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    throw new BadRequestException(`${key} must be a string.`);
  }

  const text = String(value).trim();
  return text ? text : null;
}

export function getNumber(
  body: Record<string, unknown>,
  key: string,
  label = key,
): number {
  const value = Number(body[key]);

  if (!Number.isFinite(value)) {
    throw new BadRequestException(`${label} must be a valid number.`);
  }

  return value;
}

export function getOptionalNumber(
  body: Record<string, unknown>,
  key: string,
): number | null {
  if (!(key in body) || body[key] === null || body[key] === undefined) {
    return null;
  }

  const value = Number(body[key]);
  if (!Number.isFinite(value)) {
    throw new BadRequestException(`${key} must be a valid number.`);
  }

  return value;
}

export function getBoolean(
  body: Record<string, unknown>,
  key: string,
  label = key,
): boolean {
  const value = body[key];
  if (typeof value !== 'boolean') {
    throw new BadRequestException(`${label} must be true or false.`);
  }

  return value;
}

export function getRecord(
  body: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = body[key];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0),
    ),
  ];
}

export function requireEnum<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): T {
  if (!allowed.includes(value as T)) {
    throw new BadRequestException(
      `${label} must be one of: ${allowed.join(', ')}.`,
    );
  }

  return value as T;
}

export function optionalUuid(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return UUID_PATTERN.test(value) ? value : null;
}

export function createTrackingNumber(prefix = 'PKS'): string {
  const now = new Date();
  const year = now.getFullYear();
  const serial = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${serial}`;
}

export function createQrCodeUri(trackingNumber: string): string {
  return `pakiship://track/${encodeURIComponent(trackingNumber)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function startOfPhilippineDay(now = new Date()): Date {
  const shifted = new Date(
    now.getTime() + PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000,
  );
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(
    shifted.getTime() - PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000,
  );
}

export function startOfPhilippineWeek(now = new Date()): Date {
  const dayStart = startOfPhilippineDay(now);
  const shifted = new Date(
    dayStart.getTime() + PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000,
  );
  const dayOfWeek = shifted.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  shifted.setUTCDate(shifted.getUTCDate() - diffToMonday);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(
    shifted.getTime() - PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000,
  );
}

export function startOfPhilippineMonth(now = new Date()): Date {
  const shifted = new Date(
    now.getTime() + PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000,
  );
  shifted.setUTCDate(1);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(
    shifted.getTime() - PH_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000,
  );
}

export function periodStart(period: string | undefined): Date {
  const normalized = period ?? 'today';
  if (normalized === 'week') {
    return startOfPhilippineWeek();
  }
  if (normalized === 'month') {
    return startOfPhilippineMonth();
  }
  if (normalized !== 'today') {
    throw new BadRequestException('period must be one of: today, week, month.');
  }

  return startOfPhilippineDay();
}

export function assertJpegOrPng(mimeType: string): void {
  if (!['image/jpeg', 'image/png'].includes(mimeType)) {
    throw new UnsupportedMediaTypeException(
      'Only JPG and PNG uploads are allowed.',
    );
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}
