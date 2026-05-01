import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const PING_TIMEOUT_MS = 3_000;

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private serverClient: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!url || !anonKey || !serviceRoleKey) {
      this.logger.warn(
        'SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
          'SupabaseService will not be available.',
      );
      return;
    }

    this.serverClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient | null {
    return this.adminClient;
  }

  requireClient(): SupabaseClient {
    if (this.adminClient === null) {
      throw new ServiceUnavailableException(
        'Supabase is not configured for this backend.',
      );
    }

    return this.adminClient;
  }

  createServerClient(): SupabaseClient {
    if (this.serverClient === null) {
      throw new ServiceUnavailableException(
        'Supabase is not configured for this backend.',
      );
    }

    return this.serverClient;
  }

  createAdminClient(): SupabaseClient {
    if (this.adminClient === null) {
      throw new ServiceUnavailableException(
        'Supabase is not configured for this backend.',
      );
    }

    return this.adminClient;
  }

  async ping(): Promise<boolean> {
    const adminClient = this.adminClient;

    if (adminClient === null) {
      return false;
    }

    const attempt = async (): Promise<boolean> => {
      try {
        const { error } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1,
        });
        return error === null;
      } catch {
        return false;
      }
    };

    let timerId: ReturnType<typeof setTimeout>;
    const timeout = new Promise<boolean>((resolve) => {
      timerId = setTimeout(() => resolve(false), PING_TIMEOUT_MS);
    });

    return Promise.race([attempt(), timeout]).finally(() => {
      clearTimeout(timerId);
    });
  }
}
