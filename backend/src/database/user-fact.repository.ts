import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import type { AuthRole } from '../auth/auth.types.js';

export interface UserFactRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: AuthRole | string | null;
}

export interface UserFactUpsertInput {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: AuthRole;
  terms_accepted_at: string;
  city: string | null;
  province: string | null;
  street_address: string | null;
}

@Injectable()
export class UserFactRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  private table() {
    return this.supabaseService.createAdminClient().from('USER_FACT_TABLE');
  }

  private fail(error: unknown, fallbackMessage: string): never {
    if (error && typeof error === 'object') {
      const supabaseError = error as {
        code?: string;
        message?: string;
        details?: string;
        hint?: string;
      };

      if (supabaseError.code === '23505') {
        throw new ConflictException(
          supabaseError.message || 'Duplicate value rejected by the database.',
        );
      }

      throw new InternalServerErrorException(
        supabaseError.message ||
          supabaseError.details ||
          supabaseError.hint ||
          fallbackMessage,
      );
    }

    throw new InternalServerErrorException(fallbackMessage);
  }

  async findByEmail(email: string): Promise<UserFactRow | null> {
    const { data, error } = await this.table()
      .select('user_id, full_name, email, phone_number, role')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      this.fail(error, 'Unable to look up profile by email.');
    }

    return data ?? null;
  }

  async findByPhone(phoneNumber: string): Promise<UserFactRow | null> {
    const { data, error } = await this.table()
      .select('user_id, full_name, email, phone_number, role')
      .eq('phone_number', phoneNumber)
      .maybeSingle();

    if (error) {
      this.fail(error, 'Unable to look up profile by mobile number.');
    }

    return data ?? null;
  }

  async findByUserId(userId: string): Promise<UserFactRow | null> {
    const { data, error } = await this.table()
      .select('user_id, full_name, email, phone_number, role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.fail(error, 'Unable to look up profile by user id.');
    }

    return data ?? null;
  }

  async upsert(input: UserFactUpsertInput): Promise<UserFactRow | null> {
    const payload = {
      user_id: input.user_id,
      full_name: input.full_name,
      email: input.email,
      phone_number: input.phone_number,
      role: input.role,
      terms_accepted_at: input.terms_accepted_at,
      city: input.city,
      province: input.province,
      street_address: input.street_address,
    };

    const { data, error } = await this.table()
      .upsert(payload, { onConflict: 'user_id' })
      .select('user_id, full_name, email, phone_number, role')
      .single();

    if (error) {
      this.fail(error, 'Unable to save profile.');
    }

    return data ?? null;
  }
}
