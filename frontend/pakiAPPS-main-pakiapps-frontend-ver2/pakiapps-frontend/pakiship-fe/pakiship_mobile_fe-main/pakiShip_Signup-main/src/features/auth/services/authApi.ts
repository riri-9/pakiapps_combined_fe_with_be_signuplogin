import { runtimeConfig } from '../../../config/runtime';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types';

type ForgotPasswordRequest = {
  email: string;
};

const normalizePhone = (value: string) => value.replace(/\D/g, '');

function normalizeDob(value: string): string {
  const trimmed = value.trim();
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

  const slashMatch = trimmed.match(ddmmyyyy);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
      utcDate.getUTCFullYear() === Number(year) &&
      utcDate.getUTCMonth() === Number(month) - 1 &&
      utcDate.getUTCDate() === Number(day)
    ) {
      return utcDate.toISOString();
    }
  }

  const isoMatch = trimmed.match(isoDate);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
      utcDate.getUTCFullYear() === Number(year) &&
      utcDate.getUTCMonth() === Number(month) - 1 &&
      utcDate.getUTCDate() === Number(day)
    ) {
      return utcDate.toISOString();
    }
  }

  return trimmed;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Request failed.');
  }

  return payload as T;
}

export const authApi = {
  signup(input: SignupRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        dob: normalizeDob(input.dob),
        email: input.email.trim().toLowerCase(),
        mobile: normalizePhone(input.mobile),
      }),
    });
  },

  login(input: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        emailOrMobile: input.emailOrMobile.includes('@')
          ? input.emailOrMobile.trim().toLowerCase()
          : normalizePhone(input.emailOrMobile),
      }),
    });
  },

  forgotPassword(input: ForgotPasswordRequest): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email.trim().toLowerCase(),
      }),
    });
  },
};
