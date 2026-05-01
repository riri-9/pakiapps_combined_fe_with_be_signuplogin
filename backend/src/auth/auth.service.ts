import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service.js';
import type {
  AuthResponse,
  AuthRole,
  AuthSessionResponse,
} from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignupDto } from './dto/signup.dto.js';

type AuthUserMetadata = Record<string, unknown>;

function normalizeRole(input: string): AuthRole {
  const role = input.trim().toLowerCase().replace(/[\s-]+/g, '_');

  if (role === 'driver') return 'driver';
  if (role === 'operator') return 'operator';
  if (role === 'customer' || role === 'parcel_sender' || role === 'sender') {
    return 'customer';
  }

  throw new BadRequestException(
    'role must be one of: parcel_sender, customer, driver, operator.',
  );
}

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) {
    throw new BadRequestException('email must be a valid email address.');
  }
  return normalized;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D+/g, '');
  if (!/^\d{10,15}$/.test(digits)) {
    throw new BadRequestException(
      'mobile must contain 10 to 15 digits after normalization.',
    );
  }

  return digits;
}

function frontendRole(role: AuthRole): string {
  return role;
}

function buildSessionResponse(session: {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}): AuthSessionResponse {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
  };
}

function getMetadataString(metadata: AuthUserMetadata, key: string): string | null {
  const value = metadata[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mapAuthUser(user: User, fallbackRole: AuthRole): AuthResponse['user'] {
  const metadata = user.user_metadata as AuthUserMetadata;
  const role = normalizeRole(String(metadata.role ?? fallbackRole));
  const fullName =
    getMetadataString(metadata, 'full_name') ??
    getMetadataString(metadata, 'fullName') ??
    user.user_metadata?.name?.toString()?.trim() ??
    'PakiSHIP User';

  return {
    id: user.id,
    email: user.email ?? '',
    fullName,
    role: frontendRole(role),
  };
}

async function findAuthUserByEmail(
  supabase: ReturnType<SupabaseService['createAdminClient']>,
  email: string,
): Promise<User | null> {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new BadRequestException(
        error.message || 'Unable to inspect existing accounts.',
      );
    }

    const user = data.users.find(
      (item) => item.email?.trim().toLowerCase() === email,
    );

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      break;
    }

    page += 1;
  }

  return null;
}

async function findAuthUserByPhone(
  supabase: ReturnType<SupabaseService['createAdminClient']>,
  phone: string,
): Promise<User | null> {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw new BadRequestException(
        error.message || 'Unable to inspect existing accounts.',
      );
    }

    const user = data.users.find((item) => {
      const metadata = item.user_metadata as AuthUserMetadata;
      return (
        getMetadataString(metadata, 'phone') === phone ||
        getMetadataString(metadata, 'mobile') === phone ||
        item.phone === phone
      );
    });

    if (user) {
      return user;
    }

    if (data.users.length < 100) {
      break;
    }

    page += 1;
  }

  return null;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async signup(body: SignupDto): Promise<AuthResponse> {
    const supabase = this.supabaseService.createAdminClient();
    const role = normalizeRole(body.role);
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.mobile);
    const fullName = body.fullName.trim();
    const street = body.street.trim();
    const city = body.city.trim();
    const province = body.province.trim();

    const duplicateEmail = await findAuthUserByEmail(supabase, email);
    const duplicatePhone = await findAuthUserByPhone(supabase, phone);

    if (duplicateEmail || duplicatePhone) {
      throw new ConflictException(
        'An account with that email or mobile already exists.',
      );
    }

    const createUserResult = await supabase.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        role,
        dob: body.dob,
        street,
        city,
        province,
      },
    });

    if (createUserResult.error || !createUserResult.data.user) {
      const message =
        createUserResult.error?.message ?? 'Unable to create user.';
      if (message.toLowerCase().includes('already')) {
        throw new ConflictException(
          'An account with that email or mobile already exists.',
        );
      }

      throw new BadRequestException(message);
    }

    return {
      message: 'Signup successful.',
      user: mapAuthUser(createUserResult.data.user, role),
    };
  }

  async login(body: LoginDto): Promise<AuthResponse> {
    const supabase = this.supabaseService.createServerClient();
    const credential = body.emailOrMobile.trim();
    const isEmail = credential.includes('@');
    const email = isEmail
      ? normalizeEmail(credential)
      : await this.resolveEmailFromPhone(credential);

    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    });

    if (
      signInResult.error ||
      !signInResult.data.user ||
      !signInResult.data.session
    ) {
      throw new UnauthorizedException(
        'Invalid email/mobile number or password.',
      );
    }

    const user = signInResult.data.user;
    const metadata = user.user_metadata as AuthUserMetadata;
    const role = normalizeRole(String(metadata.role ?? 'customer'));

    return {
      message: 'Login successful.',
      user: mapAuthUser(user, role),
      session: buildSessionResponse(signInResult.data.session),
    };
  }

  private async resolveEmailFromPhone(phoneInput: string): Promise<string> {
    const phone = normalizePhone(phoneInput);
    const supabase = this.supabaseService.createAdminClient();
    const user = await findAuthUserByPhone(supabase, phone);

    if (!user?.email) {
      throw new UnauthorizedException('Invalid mobile number or password.');
    }

    return user.email;
  }
}
